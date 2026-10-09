/* Private member data uses the existing identity guard and database, apart from planner records. */
const {createHash,randomUUID}=require('node:crypto');
const {cleanAvatar}=require('./member-image.cjs');
const team=require('./team.cjs');
const TTL_SECONDS=120;
const failure=(message,status)=>Object.assign(new Error(message),{status});
const memberKey=(actor,scope)=>createHash('sha256').update('atlas-member\0'+scope+'\0'+actor.id).digest('hex');
const label=value=>typeof value==='string'&&value.trim()&&!value.includes('@')?value.trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,60)||'Workspace member':'Workspace member';
function body(req,keys){
 if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw failure('Send a JSON request.',415);
 let b=req.body;if(typeof b==='string'){if(b.length>410000)throw failure('The photo is too large.',413);try{b=JSON.parse(b);}catch{throw failure('Invalid request.',400);}}
 if(!b||Array.isArray(b)||typeof b!=='object'||Object.keys(b).some(k=>!keys.includes(k)))throw failure('Invalid request.',400);return b;
}
const session=value=>{if(typeof value!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))throw failure('Invalid presence session.',400);return value.toLowerCase();};
const version=value=>{if(value!==null&&(typeof value!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)))throw failure('Reload the current profile photo before saving.',400);return value;};
function handlers(deps={}){
 const identity=deps.identity||team.identity,sql=deps.sql||team.sql,environment=deps.environment||team.environment,enabled=deps.enabled||(()=>process.env.ATLAS_MEMBER_FEATURES==='true');
 async function run(req,res,allowed,work){
  res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Vary','Authorization');
  if(!allowed.includes(req.method)){res.setHeader('Allow',allowed.join(', '));return res.status(405).json({error:'Method not allowed'});}
  try{
   if(!enabled())throw failure('Member photos and presence are not available yet.',503);
   const actor=await identity(req),scope=environment(),key=memberKey(actor,scope);return await work(actor,scope,key,sql());
  }catch(e){return res.status(e.status||503).json({error:e.status?e.message:'Member information is temporarily unavailable. Your planning records are unchanged.'});}
 }
 async function profile(req,res){return run(req,res,['GET','PUT','DELETE'],async(actor,scope,key,db)=>{
  if(req.method==='GET'){
   const [p]=await db`SELECT display_name,photo_version FROM atlas_member_profiles WHERE scope=${scope} AND member_key=${key}`;
   return res.json({memberKey:key,name:p?.display_name||'Workspace member',photoVersion:p?.photo_version||null});
  }
  const b=body(req,req.method==='PUT'?['png','expectedVersion']:['expectedVersion']),expected=version(b.expectedVersion),next=req.method==='PUT'?randomUUID():null,png=req.method==='PUT'?cleanAvatar(b.png):null;
  const [saved]=await db`INSERT INTO atlas_member_profiles(scope,member_key,display_name,photo_png,photo_version) SELECT ${scope},${key},'Workspace member',decode(${png?png.toString('hex'):null},'hex'),${next}::uuid WHERE ${expected}::uuid IS NULL OR EXISTS(SELECT 1 FROM atlas_member_profiles WHERE scope=${scope} AND member_key=${key} AND photo_version=${expected}::uuid) ON CONFLICT(scope,member_key) DO UPDATE SET photo_png=EXCLUDED.photo_png,photo_version=EXCLUDED.photo_version,updated_at=now() WHERE atlas_member_profiles.photo_version IS NOT DISTINCT FROM ${expected}::uuid RETURNING photo_version`;
  if(!saved)throw failure('Your photo changed in another tab or device. Reload it before trying again.',409);
  return res.json({memberKey:key,photoVersion:saved.photo_version||null});
 });}
 async function photo(req,res){return run(req,res,['GET'],async(actor,scope,key,db)=>{
  const requested=req.query?.member||key;if(typeof requested!=='string'||!/^[a-f0-9]{64}$/.test(requested))throw failure('Invalid member.',400);
  const [p]=await db`SELECT encode(photo_png,'base64') AS png FROM atlas_member_profiles WHERE scope=${scope} AND member_key=${requested}`;
  if(!p?.png)return res.status(404).json({error:'No profile photo.'});res.setHeader('Content-Type','image/png');return res.status(200).send(Buffer.from(p.png,'base64'));
 });}
 async function presence(req,res){return run(req,res,['GET','PUT','DELETE'],async(actor,scope,key,db)=>{
  if(req.method==='GET'){
   const cursor=req.query?.cursor||'';if(typeof cursor!=='string'||(cursor&&!/^[a-f0-9]{64}$/.test(cursor)))throw failure('Invalid member page.',400);
   const rows=await db`SELECT p.member_key,p.display_name,p.photo_version,EXISTS(SELECT 1 FROM atlas_member_sessions s WHERE s.scope=p.scope AND s.member_key=p.member_key AND s.ended_at IS NULL AND s.last_seen>now()-${TTL_SECONDS}::integer*interval '1 second') AS online FROM atlas_member_profiles p WHERE p.scope=${scope} AND p.member_key>${cursor} ORDER BY p.member_key LIMIT 101`;
   return res.json({members:rows.slice(0,100).map(p=>({id:p.member_key,name:p.display_name,state:p.online?'online':'offline',photoVersion:p.photo_version||null,self:p.member_key===key})),nextCursor:rows.length>100?rows[99].member_key:null,timeoutSeconds:TTL_SECONDS});
  }
  const b=body(req,req.method==='PUT'?['sessionId','name']:['sessionId']),id=session(b.sessionId);
  if(req.method==='DELETE'){
   // Tombstones prevent a delayed heartbeat from making a logged-out session online again.
   await db`INSERT INTO atlas_member_sessions(scope,member_key,session_id,last_seen,ended_at) VALUES(${scope},${key},${id},now(),now()) ON CONFLICT(scope,member_key,session_id) DO UPDATE SET ended_at=now()`;
   return res.json({ended:true});
  }
  const [live]=await db`WITH member AS (INSERT INTO atlas_member_profiles(scope,member_key,display_name) VALUES(${scope},${key},${label(b.name)}) ON CONFLICT(scope,member_key) DO UPDATE SET display_name=EXCLUDED.display_name RETURNING member_key,photo_version), live AS (INSERT INTO atlas_member_sessions(scope,member_key,session_id,last_seen) SELECT ${scope},member_key,${id},now() FROM member ON CONFLICT(scope,member_key,session_id) DO UPDATE SET last_seen=now() WHERE atlas_member_sessions.ended_at IS NULL RETURNING session_id) SELECT live.session_id,member.photo_version FROM live CROSS JOIN member`;
  if(!live)throw failure('This presence session has ended.',409);
  await db`DELETE FROM atlas_member_sessions WHERE scope=${scope} AND last_seen<now()-interval '24 hours'`;
  return res.json({online:true,memberKey:key,photoVersion:live.photo_version||null,timeoutSeconds:TTL_SECONDS});
 });}
 return {profile,photo,presence};
}
module.exports={handlers,memberKey,label,TTL_SECONDS};
