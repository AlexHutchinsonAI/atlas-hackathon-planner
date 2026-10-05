/* Server-generated content summaries. Notes/contact values and client-supplied audit fields are never logged. */
const names=require('../data/operations-workstream-names.json');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const label=x=>String(x||'Untitled').replace(/[\u0000-\u001f]/g,' ').slice(0,90);
const flatten=lists=>(lists||[]).flatMap(l=>[l,...flatten(l.children)]);
const changedKeys=(a={},b={})=>[...new Set([...Object.keys(a||{}),...Object.keys(b||{})])].filter(k=>k!=='updatedAt'&&!same(a[k],b[k]));
const fields={title:'title',text:'task text',owner:'owner',ownerEmail:'owner email',date:'date',due:'due date',status:'status',done:'completion',notes:'notes',dep:'dependency',outcome:'outcome',mobilize:'mobilization',review:'review',reviewNote:'review note',lead:'lead',brief:'brief',krs:'acceptance criteria',handled:'suggestion settings',khandled:'criteria settings'};
function summarize(kind,before,next){
 const changes=[];const push=x=>{if(changes.length<30)changes.push(x);};
 function group(id,title,a,b,collections){
  if(!a||!b){push({record:id,label:label(title),action:a?'Removed workstream':'Added workstream',fields:[]});return;}
  const direct=changedKeys(a,b).filter(k=>!collections.includes(k)&&!['destiniPlan','speed'].includes(k));const changed=new Set(direct.map(k=>fields[k]||label(k)));let added=0,removed=0,updated=0;
  for(const key of collections){
   const old=key==='lists'?flatten(a[key]):a[key]||[],fresh=key==='lists'?flatten(b[key]):b[key]||[];
   const index=new Map(old.map((r,i)=>[r.id||String(i),r]));const newer=new Map(fresh.map((r,i)=>[r.id||String(i),r]));
   for(const [rid,r]of newer){const prev=index.get(rid);if(!prev){added++;continue;}const keys=changedKeys(prev,r).filter(k=>!['items','children'].includes(k));if(keys.length){updated++;keys.forEach(k=>changed.add(fields[k]||label(k)));}
    if(key==='lists'){
     const oi=new Map((prev.items||[]).map(t=>[t.id,t])),ni=new Map((r.items||[]).map(t=>[t.id,t]));
     for(const [tid,t]of ni){const oldTask=oi.get(tid);if(!oldTask){added++;continue;}const fs=changedKeys(oldTask,t);if(fs.length){updated++;fs.forEach(k=>changed.add(fields[k]||label(k)));}}
     for(const tid of oi.keys())if(!ni.has(tid))removed++;
     if(!same((prev.items||[]).map(t=>t.id),(r.items||[]).map(t=>t.id)))changed.add('task order');
    }
   }
   for(const rid of index.keys())if(!newer.has(rid))removed++;
   if(!same(old.map(r=>r.id),fresh.map(r=>r.id)))changed.add(key==='lists'?'list order':'task order');
  }
  if(changed.size||added||removed||updated){const parts=[];if(added)parts.push(`${added} added`);if(removed)parts.push(`${removed} removed`);if(updated)parts.push(`${updated} updated`);push({record:id,label:label(title),action:parts.length?'Changed records: '+parts.join(', '):'Updated workstream',fields:[...changed].slice(0,12)});}
 }
 if(kind==='workspace'){
  const old=new Map((before.workstreams||[]).map(w=>[w.id,w])),fresh=new Map((next.workstreams||[]).map(w=>[w.id,w]));
  for(const id of new Set([...old.keys(),...fresh.keys()]))group(id,fresh.get(id)?.title||old.get(id)?.title,old.get(id),fresh.get(id),['lists']);
  if(!same((before.workstreams||[]).map(w=>w.id),(next.workstreams||[]).map(w=>w.id)))push({record:'workstream-order',label:'Workspace workstreams',action:'Changed workstream order',fields:[]});
  for(const key of ['command','walkthrough'])if(!same(before[key],next[key]))push({record:key,label:key==='command'?'Dashboard targets and settings':'Planning decisions and readiness',action:'Updated planning settings',fields:changedKeys(before[key],next[key]).map(label).slice(0,12)});
 }else{
  const custom=new Map([...(before.custom||[]),...(next.custom||[])].map(w=>[w.id,w.name]));
  for(const id of new Set([...Object.keys(before.plans||{}),...Object.keys(next.plans||{})]))group(id,custom.get(id)||names[id]||id,before.plans?.[id],next.plans?.[id],['tasks']);
  if(!same(before.custom,next.custom))push({record:'custom',label:'Custom workstreams',action:'Updated custom workstream register',fields:[]});
  const sections={execState:'Goals and decisions',webState:'Website readiness',judgeState:'Judge roster',actState:'Actions',qState:'Question bank',reviewState:'Planning review',ambassadorState:'Ambassadors',goalState:'Event goals'};
  for(const [key,title]of Object.entries(sections))for(const id of changedKeys(before[key],next[key]))push({record:key+':'+label(id),label:title+' · '+label(id),action:!before[key]?.[id]?'Added record':!next[key]?.[id]?'Removed record':'Updated record',fields:changedKeys(before[key]?.[id],next[key]?.[id]).map(k=>fields[k]||label(k)).slice(0,12)});
 }
 return changes;
}
let schemaReady;
async function ensureSchema(db){if(!schemaReady)schemaReady=db`CREATE TABLE IF NOT EXISTS atlas_activity (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, scope text NOT NULL, revision integer NOT NULL, actor_email text NOT NULL, actor_id text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), changes jsonb NOT NULL, UNIQUE(scope,revision))`.catch(e=>{schemaReady=null;throw e;});await schemaReady;}
async function saveWithActivity(db,{scope,revision,plan,actor,current,kind}){
 const changes=summarize(kind,current,plan);await ensureSchema(db);
 if(!changes.length)return db`UPDATE atlas_plans SET body=${JSON.stringify(plan)},revision=revision+1,updated_at=now(),updated_by=${actor.email} WHERE scope=${scope} AND revision=${revision} RETURNING revision`;
 return db`WITH saved AS (UPDATE atlas_plans SET body=${JSON.stringify(plan)},revision=revision+1,updated_at=now(),updated_by=${actor.email} WHERE scope=${scope} AND revision=${revision} RETURNING revision,updated_at), logged AS (INSERT INTO atlas_activity(scope,revision,actor_email,actor_id,created_at,changes) SELECT ${scope},revision,${actor.email},${actor.id},updated_at,${JSON.stringify(changes)}::jsonb FROM saved RETURNING id) SELECT revision FROM saved`;
}
module.exports={summarize,ensureSchema,saveWithActivity};
