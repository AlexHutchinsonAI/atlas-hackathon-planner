const {identity,sql,environment}=require('../lib/team.cjs');
const {ensureSchema}=require('../lib/activity.cjs');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 try{
  const actor=await identity(req),db=sql(),scope=environment(),operations=scope+':operations';await ensureSchema(db);
  const events=await db`SELECT id,scope,revision,actor_email AS "actorEmail",created_at AS "createdAt",changes FROM atlas_activity WHERE scope IN (${scope},${operations}) ORDER BY id DESC LIMIT 40`;
  const lastSaved=await db`SELECT scope,revision,updated_by AS "actorEmail",updated_at AS "createdAt" FROM atlas_plans WHERE scope IN (${scope},${operations}) ORDER BY updated_at DESC`;
  res.json({actor:{email:actor.email,editor:Boolean(actor.editor||actor.manager),manager:Boolean(actor.manager)},events:events.map(e=>({...e,view:e.scope===scope?'Workspace':'Operations'})),lastSaved:lastSaved.map(e=>({...e,view:e.scope===scope?'Workspace':'Operations'})),historyNotice:'Change history begins with saves made after this feature was added. Earlier changes are not reconstructed.'});
 }catch(e){res.status(e.status||500).json({error:e.status?e.message:'Recent activity is temporarily unavailable.'});}
};
