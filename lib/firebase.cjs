/* Verify signatures/project claims and current verified account on every request. No private admin key needed. */
const {getApps,initializeApp}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const OWNER='alex.hutchinson@intellibus.com';
function webConfig(env=process.env){
 try {
  const c=JSON.parse(env.ATLAS_FIREBASE_WEB_CONFIG||'null');
  if(!c || typeof c.projectId!=='string' || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(c.projectId) || c.authDomain!==c.projectId+'.firebaseapp.com' || typeof c.apiKey!=='string' || !c.apiKey.startsWith('AIza') || typeof c.appId!=='string' || !c.appId.startsWith('1:'))return null;
  return {apiKey:c.apiKey,authDomain:c.authDomain,projectId:c.projectId,appId:c.appId};
 }catch{return null;}
}
const failure=(message,status)=>Object.assign(new Error(message),{status});
function actorFromAccount(claims,account,env=process.env){
 if(!account || account.disabled || account.localId!==claims.uid || !account.emailVerified || claims.email_verified!==true || typeof account.email!=='string' || account.email.toLowerCase()!==String(claims.email||'').toLowerCase())throw failure('Sign in with a currently verified email address.',403);
 if(Number(account.validSince||0)>Number(claims.auth_time||0))throw failure('Your sign-in was revoked. Sign in again.',401);
 const email=account.email.toLowerCase();
 const manager=email===OWNER, editor=manager || env.ATLAS_VERIFIED_EDITORS==='true';
 return {id:'firebase:'+claims.uid,email,manager,editor,readOnly:!editor};
}
async function identity(req){
 const c=webConfig();if(!c)throw failure('Firebase sign-in setup is not complete.',503);
 const header=req.headers.authorization||'';
 if(!/^Bearer \S+$/.test(header))throw failure('Sign in to view the shared planner.',401);
 const token=header.slice(7);let claims;
 try {
  const name='atlas-'+c.projectId;
  const app=getApps().find(a=>a.name===name)||initializeApp({projectId:c.projectId},name);
  claims=await getAuth(app).verifyIdToken(token);
 }catch{throw failure('Your sign-in is expired or invalid.',401);}
 // A signature alone does not detect disabled/deleted accounts, verification changes or revocation.
 let response,data;
 try {
  response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+encodeURIComponent(c.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token}),signal:AbortSignal.timeout(8000)});
  data=await response.json();
 }catch{throw failure('Account verification is temporarily unavailable. Your draft is retained.',503);}
 if(!response.ok)throw failure('Your account session is no longer valid. Sign in again.',401);
 return actorFromAccount(claims,data.users?.[0]);
}
module.exports={webConfig,identity,actorFromAccount,OWNER};
