const {test}=require('node:test');const assert=require('node:assert/strict');
const {summarize,saveWithActivity}=require('../lib/activity.cjs');const seed=require('../data/command-seed.js');
const actor={email:'verified@example.com',id:'firebase:verified',editor:true,manager:false};
function database(plan,revision=7){const state={plan:structuredClone(plan),revision,events:[],queries:[],failAudit:false};
 const db=async(strings,...values)=>{const text=strings.join('?');state.queries.push({text,values});if(text.includes('CREATE TABLE'))return[];
  if(text.includes('UPDATE atlas_plans')){
   if(values[3]!==state.revision)return[];
   const logged=text.startsWith('WITH saved');if(logged&&state.failAudit)throw Error('audit storage unavailable');
   state.plan=JSON.parse(values[0]);state.revision++;
   if(logged)state.events.push({scope:values[4],revision:state.revision,actorEmail:values[5],actorId:values[6],changes:JSON.parse(values[7])});return[{revision:state.revision}];
  }return[];
 };return{db,state};}
test('workspace summary groups changed fields and excludes private values and client identity',()=>{
 const next=structuredClone(seed);next.workstreams[0].lists[0].items[0].notes='PRIVATE_NOTE_VALUE';next.workstreams[0].lists[0].items[0].status='Done';next.actorEmail='SPOOFED_ACCOUNT';
 const changes=summarize('workspace',seed,next);assert.equal(changes.length,1);assert(changes[0].fields.includes('notes'));assert(changes[0].fields.includes('status'));assert(!JSON.stringify(changes).includes('PRIVATE_NOTE_VALUE'));assert(!JSON.stringify(changes).includes('SPOOFED_ACCOUNT'));
});
test('operations summary identifies workstream and roster record without copying note/contact values',()=>{
 const before={plans:{ws16:{tasks:[{id:'a',title:'A',owner:'Original',due:'',done:false}],mobilize:{notes:'old'}}},judgeState:{Judge:{notes:'old'}}};const next=structuredClone(before);next.plans.ws16.tasks[0].owner='PRIVATE_OWNER_VALUE';next.plans.ws16.tasks[0].due='2026-10-16';next.judgeState.Judge.notes='PRIVATE_CONTACT_VALUE';
 const changes=summarize('operations',before,next);assert.equal(changes[0].label,'Network & Internet');assert(changes[0].fields.includes('owner'));assert(changes[0].fields.includes('due date'));assert(changes.some(c=>c.label==='Judge roster · Judge'));assert(!JSON.stringify(changes).includes('PRIVATE_'));
});
test('successful debounced snapshot produces one server-attributed event with multiple changes',async()=>{
 const next=structuredClone(seed);next.workstreams[0].brief+=' clarified';next.workstreams[1].brief+=' clarified';next.actorEmail='spoof@example.com';next.createdAt='1900-01-01';const{db,state}=database(seed);
 const result=await saveWithActivity(db,{scope:'production',revision:7,plan:next,actor,current:seed,kind:'workspace'});assert.equal(result[0].revision,8);assert.equal(state.events.length,1);assert.equal(state.events[0].changes.length,2);assert.equal(state.events[0].actorEmail,actor.email);assert.equal(state.events[0].actorId,actor.id);
 const query=state.queries.find(q=>q.text.startsWith('WITH saved'));assert(query.text.includes('INSERT INTO atlas_activity'));assert(query.text.includes('FROM saved'));assert(query.text.includes('updated_at'));assert(!query.text.includes('UPDATE atlas_activity'));
});
test('concurrent saves at the same revision produce only one content update and activity event',async()=>{
 const{db,state}=database(seed);const a=structuredClone(seed),b=structuredClone(seed);a.workstreams[0].brief+=' first';b.workstreams[0].brief+=' second';
 const results=await Promise.all([a,b].map(plan=>saveWithActivity(db,{scope:'production',revision:7,plan,actor,current:seed,kind:'workspace'})));assert.equal(results.filter(r=>r.length).length,1);assert.equal(state.revision,8);assert.equal(state.events.length,1);
});
test('failed audit transaction preserves document/revision and produces no event',async()=>{
 const{db,state}=database(seed);state.failAudit=true;const next=structuredClone(seed);next.workstreams[0].brief+=' changed';await assert.rejects(saveWithActivity(db,{scope:'production',revision:7,plan:next,actor,current:seed,kind:'workspace'}));assert.equal(state.revision,7);assert.deepEqual(state.plan,seed);assert.equal(state.events.length,0);
});
test('Save now with no content change does not invent activity',async()=>{
 const{db,state}=database(seed);await saveWithActivity(db,{scope:'production',revision:7,plan:structuredClone(seed),actor,current:seed,kind:'workspace'});assert.equal(state.events.length,0);assert.equal(state.revision,8);
});
