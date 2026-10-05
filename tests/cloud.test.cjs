const {test}=require('node:test');const assert=require('node:assert/strict');
const Queue=require('../scripts/cloud-queue.js');const {access,policyConfigured}=require('../lib/access.cjs');
function harness(request,online=()=>true){const saved=[],statuses=[],timers=[];const q=new Queue({request,persist:x=>saved.push(structuredClone(x)),status:x=>statuses.push(x),online,setTimer:(f,ms)=>{timers.push({f,ms});return timers.length;},clearTimer:()=>{}});q.start(4);return {q,saved,statuses,timers};}
test('access defaults deny and verified-email readers cannot become managers without explicit assignment',()=>{
 for(const email of ['a@intellibus.com','a@example.com'])assert.equal(access(email,{}).allowed,false);
 assert.equal(policyConfigured({}),false);
 const reader=access('a@example.com',{ATLAS_ACCESS_POLICY:'verified-email'});assert.deepEqual(reader,{allowed:true,manager:false,readOnly:true});
 assert.equal(access('a@example.com',{ATLAS_ACCESS_POLICY:'company'}).allowed,false);
 assert.equal(access('a@intellibus.com.evil.com',{ATLAS_ACCESS_POLICY:'company'}).allowed,false);
 assert.equal(access('a@example.com',{ATLAS_ACCESS_POLICY:'invited',ATLAS_MEMBER_EMAILS:'b@example.com'}).allowed,false);
 assert.equal(access('a@example.com',{ATLAS_ACCESS_POLICY:'invited',ATLAS_MEMBER_EMAILS:'a@example.com'}).allowed,true);
 assert.equal(access('a+clerk_test@example.com',{ATLAS_ACCESS_POLICY:'verified-email'}).allowed,false);
});
test('debounced edits save latest snapshot at loaded revision and clear durable queue',async()=>{
 const requests=[];const {q,saved}=harness(async x=>{requests.push(x);return {revision:5};});
 q.change({a:1});q.change({a:2});assert.equal(requests.length,0);await q.flush();assert.deepEqual(requests,[{revision:4,plan:{a:2}}]);assert.equal(saved.at(-1),null);
});
test('edits made during an in-flight save wait and use the new revision',async()=>{
 let finish;const requests=[];const {q}=harness(x=>{requests.push(x);return requests.length===1?new Promise(r=>finish=r):Promise.resolve({revision:6});});q.change({a:1});const flight=q.flush();q.change({a:2});await q.flush();assert.equal(requests.length,1);finish({revision:5});await flight;await q.flush();assert.deepEqual(requests[1],{revision:5,plan:{a:2}});
});
test('offline changes remain durable and save after reconnection',async()=>{
 let online=false,calls=0;const {q,saved}=harness(async()=>{calls++;return {revision:5};},()=>online);q.change({a:1});await q.flush();assert.equal(calls,0);assert.equal(saved.at(-1).plan.a,1);online=true;await q.flush();assert.equal(calls,1);
});
test('transient failures retry latest pending content without overwriting newer edits',async()=>{
 let calls=0;const {q,timers}=harness(async()=>{if(++calls===1)throw new Error('network');return {revision:5};});q.change({a:1});await q.flush();assert(q.pending);assert(timers.at(-1).ms<=30000);q.change({a:2});await q.flush();assert.equal(q.revision,5);assert.equal(q.pending,null);
});
test('revision conflict stops automatic retry and keeps full working draft',async()=>{
 const {q,saved}=harness(async()=>{throw Object.assign(new Error('conflict'),{status:409});});q.change({a:1});await q.flush();assert(q.blocked);assert.deepEqual(saved.at(-1),{revision:4,plan:{a:1}});await q.flush();assert.equal(q.revision,4);
});
test('401 and 403 failures are retained and never retried automatically',async()=>{
 for(const status of [401,403]){const {q}=harness(async()=>{throw Object.assign(new Error('denied'),{status});});q.change({a:1});await q.flush();assert(q.blocked);assert(q.pending);}
});
test('late completion after sign-out cannot update another account revision or queue',async()=>{
 let finish;const {q,saved}=harness(()=>new Promise(r=>finish=r));q.change({a:1});const flight=q.flush();q.stop();q.start(10);finish({revision:5});await flight;assert.equal(q.revision,10);assert.equal(saved.at(-1).plan.a,1);
});
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function endpoint(name,actor,revision=0){let queries=0;const db=(strings,...values)=>{queries++;if(strings.join('').includes('UPDATE'))return Promise.resolve(values[3]===revision?[{revision:revision+1}]:[]);if(strings.join('').includes('SELECT'))return Promise.resolve([{body:require('../data/command-seed.js'),revision}]);return Promise.resolve([]);};const mod={exports:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../api/'+name+'.js'),'utf8'),{module:mod,require:id=>id==='../lib/team.cjs'?{identity:async()=>{if(!actor)throw Object.assign(new Error('sign in'),{status:401});return actor;},sql:()=>db,environment:()=> 'test'}:require(path.join(__dirname,'../api',id))});return {handler:mod.exports,queries:()=>queries};}
function response(){return {code:200,setHeader(){},status(x){this.code=x;return this;},json(x){this.body=x;return this;}};}
test('signed-out requests cannot read either cloud document or reach the database',async()=>{
 for(const name of ['team-plan','team-operations','team-activity']){const e=endpoint(name,null),res=response();await e.handler({method:'GET'},res);assert.equal(res.code,401);assert.equal(e.queries(),0);}
});
test('verified-email readers can load but cannot write either cloud document',async()=>{
 for(const name of ['team-plan','team-operations']){const e=endpoint(name,{id:'reader',email:'reader@example.com',readOnly:true,manager:false});const res=response();await e.handler({method:'GET'},res);assert.equal(res.code,200);const put=response();await e.handler({method:'PUT',body:{revision:0,plan:require('../data/command-seed.js')}},put);assert.equal(put.code,403);}
});
test('production integration stays disabled without approved policy or live Clerk credentials',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../lib/team.cjs'),'utf8');
 function configured(env){const module={exports:{}};vm.runInNewContext(source,{module,process:{env},require:id=>id==='@clerk/backend'?{}:id==='@neondatabase/serverless'?{}:{access,policyConfigured:()=>policyConfigured(env)}});return module.exports.configured();}
 const env={VERCEL_ENV:'production',CLERK_SECRET_KEY:'placeholder',NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:'pk_live_placeholder',DATABASE_URL:'placeholder'};
 assert.equal(configured(env),false);assert.equal(configured({...env,ATLAS_ACCESS_POLICY:'verified-email'}),true);
 assert.equal(configured({...env,ATLAS_ACCESS_POLICY:'verified-email',NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:'pk_test_placeholder'}),false);
});

test('verified non-owner editors save both existing documents with revision checks and cannot initialize/import',async()=>{
 const actor={id:'firebase:outside',email:'outside@example.com',editor:true,readOnly:false,manager:false};
 const operations={plans:{},custom:[],execState:{goals:{},decisions:{}},webState:{},judgeState:{},actState:{},qState:{},reviewState:{},ambassadorState:{},goalState:{}};
 for(const name of ['team-plan','team-operations']) {
  const plan=name==='team-plan'?structuredClone(require('../data/command-seed.js')):operations;
  const e=endpoint(name,actor,7),saved=response();await e.handler({method:'PUT',body:{revision:7,plan}},saved);assert.equal(saved.code,200);assert.equal(saved.body.revision,8);
  const imported=response();await e.handler({method:'PUT',body:{revision:7,plan,operation:'import'}},imported);assert.equal(imported.code,403);
  const initial=endpoint(name,actor,0),denied=response();await initial.handler({method:'PUT',body:{revision:0,plan}},denied);assert.equal(denied.code,403);
  const stale=response();await e.handler({method:'PUT',body:{revision:6,plan}},stale);assert.equal(stale.code,409);
 }
});
