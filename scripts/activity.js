/* Shared account attribution and bounded recent history; no sign-in/session tracking. */
(()=>{
 const panel=document.createElement('details');panel.id='atlas-activity';panel.innerHTML='<summary>Recent changes · Sign in to view shared history</summary><div class="activity-content"><p data-activity-account></p><p data-activity-notice></p><ol data-activity-events></ol><button type="button" data-activity-refresh>Refresh activity</button></div>';
 // Activity appearance is defined in the shared component stylesheet.
 document.body.append(panel);
 const place=()=>{const dock=document.querySelector('.save-dock');if(dock&&dock.nextElementSibling!==panel)dock.after(panel);};place();new MutationObserver(place).observe(document.body,{childList:true,subtree:true});
 let load,actor,timer,inflight=false,epoch=0;
 const format=value=>{const d=new Date(value);return Number.isNaN(d.getTime())?'Time unavailable':d.toLocaleString();};
 async function refresh(){
  if(!load||inflight||navigator.onLine===false)return;inflight=true;const activeEpoch=epoch;
  try{
   const result=await load();if(activeEpoch!==epoch)return;
   actor=result.actor;const events=result.events||[],last=events[0];
   panel.querySelector('summary').textContent=last?`Recent changes · Signed in: ${actor.email} · Last changed by ${last.actorEmail} · ${format(last.createdAt)}`:`Recent changes · Signed in: ${actor.email} · No changes recorded yet`;
   panel.querySelector('[data-activity-account]').textContent=`Signed in: ${actor.email} · ${actor.editor?'Editing enabled':'View only'}`;
   const legacy=result.lastSaved?.[0];panel.querySelector('[data-activity-notice]').textContent=result.historyNotice+(legacy&&!last?` Last saved before recorded history: ${legacy.actorEmail||'Account unavailable'} · ${format(legacy.createdAt)}.`:'');
   const list=panel.querySelector('ol');list.replaceChildren();
   for(const event of events){const li=document.createElement('li'),who=document.createElement('strong'),time=document.createElement('time'),scope=document.createElement('p');who.textContent=event.actorEmail;time.dateTime=event.createdAt;time.textContent=' · '+format(event.createdAt);scope.textContent=event.view;li.append(who,time,scope);
    for(const change of event.changes||[]){const line=document.createElement('p');line.textContent=`${change.label}: ${change.action}${change.fields?.length?' · '+change.fields.join(', '):''}`;li.append(line);}list.append(li);
   }
   if(!events.length){const empty=document.createElement('li');empty.textContent='The next successful content change will appear here.';list.append(empty);}
  }catch{if(activeEpoch===epoch)panel.querySelector('[data-activity-notice]').textContent='Recent activity is temporarily unavailable. Your planner save status is shown separately.';}
  finally{inflight=false;if(activeEpoch!==epoch&&load)refresh();}
 }
 function disconnect(){epoch++;load=null;actor=null;clearInterval(timer);panel.querySelector('summary').textContent='Recent changes · Sign in to view shared history';panel.querySelector('ol').replaceChildren();panel.querySelector('[data-activity-account]').textContent='';panel.querySelector('[data-activity-notice]').textContent='';}
 panel.querySelector('button').onclick=refresh;
 window.AtlasActivity={refresh,disconnect,connect(options){disconnect();actor=options.actor;load=options.load;panel.querySelector('[data-activity-account]').textContent='Signed in: '+actor.email;panel.querySelector('summary').textContent='Recent changes · Signed in: '+actor.email+' · Loading history';refresh();timer=setInterval(()=>{if(!document.hidden)refresh();},30000);}};
})();
