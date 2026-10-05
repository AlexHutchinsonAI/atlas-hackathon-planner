const {test}=require('node:test');const assert=require('node:assert/strict');
const {webConfig,actorFromAccount,identity,OWNER}=require('../lib/firebase.cjs');
const config={apiKey:'AIzaPublicTestFixture',authDomain:'atlas-planner-auth.firebaseapp.com',projectId:'atlas-planner-auth',appId:'1:123:web:test'};
const claims={uid:'u',email:OWNER,email_verified:true,auth_time:100};const account={localId:'u',email:OWNER,emailVerified:true,validSince:'90'};
test('public Firebase config is complete, project-bound and excludes tracking config',()=>{
 const env={ATLAS_FIREBASE_WEB_CONFIG:JSON.stringify({...config,measurementId:'excluded',storageBucket:'excluded'})};assert.deepEqual(webConfig(env),config);
 for(const bad of [null,{...config,authDomain:'attacker.example'},{...config,apiKey:''},{...config,projectId:'../../evil'}])assert.equal(webConfig({ATLAS_FIREBASE_WEB_CONFIG:JSON.stringify(bad)}),null);
});
test('owner-only fallback remains read-only for other verified users when editing expansion is disabled',()=>{
 assert.equal(actorFromAccount(claims,account,{}).manager,true);
 for(const email of ['viewer@example.com','other@intellibus.com','alex.hutchinson+alias@intellibus.com','alex.hutchinson@intellibus.com.evil.com']){
  const actor=actorFromAccount({...claims,email},{...account,email},{});assert.equal(actor.manager,false);assert.equal(actor.readOnly,true);
 }
});
test('changed, unverified, disabled or mismatched current accounts fail closed',()=>{
 for(const change of [{emailVerified:false},{disabled:true},{localId:'other'},{email:'different@example.com'}])assert.throws(()=>actorFromAccount(claims,{...account,...change}),e=>e.status===403);
 assert.throws(()=>actorFromAccount({...claims,email_verified:false},account),e=>e.status===403);
});
test('password reset/session revocation invalidates an earlier authenticated session',()=>{
 assert.throws(()=>actorFromAccount(claims,{...account,validSince:'101'}),e=>e.status===401);
});
test('signed-out and malformed token requests never reach current-account lookup',async()=>{
 const previous=process.env.ATLAS_FIREBASE_WEB_CONFIG;process.env.ATLAS_FIREBASE_WEB_CONFIG=JSON.stringify(config);const previousFetch=global.fetch;let calls=0;global.fetch=async()=>{calls++;throw new Error('must not run');};
 try{await assert.rejects(identity({headers:{}}),e=>e.status===401);await assert.rejects(identity({headers:{authorization:'Bearer malformed'}}),e=>e.status===401);assert.equal(calls,0);}
 finally{global.fetch=previousFetch;if(previous===undefined)delete process.env.ATLAS_FIREBASE_WEB_CONFIG;else process.env.ATLAS_FIREBASE_WEB_CONFIG=previous;}
});

test('approved policy gives every verified email content editing without owner/admin rights',()=>{
 for(const email of ['outside@example.com','other@intellibus.com','alex.hutchinson+alias@intellibus.com']) {
  const actor=actorFromAccount({...claims,email},{...account,email},{ATLAS_VERIFIED_EDITORS:'true'});
  assert.equal(actor.editor,true);assert.equal(actor.readOnly,false);assert.equal(actor.manager,false);
 }
 const owner=actorFromAccount(claims,account,{ATLAS_VERIFIED_EDITORS:'true'});assert.equal(owner.manager,true);
 assert.throws(()=>actorFromAccount(claims,{...account,emailVerified:false},{ATLAS_VERIFIED_EDITORS:'true'}),e=>e.status===403);
});
