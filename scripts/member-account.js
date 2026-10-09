/* Private avatars and shared heartbeat presence. No profile data is kept in browser storage. */
(()=>{
 if(self!==top)return;
 let connection=null,identity=null,photoVersion=null,ownPhoto='',sessionId=null,lastToken='',timer=null,generation=0,roster=[],nextCursor=null,available=false,ownState='unknown',profileReady=false,pending=null,busy=false,dialog,settings,trigger;
 let selectionId=0,photoLoadFailed=false;
 const beating=new Set();
 const photos=new Map(),requests=new Map();
 const icon=(name,size=18)=>window.AtlasIcon(name,size);
 const emit=()=>{document.dispatchEvent(new Event('atlas-members-change'));window.AtlasSidebar?.schedule();renderSettings();renderRoster();};
 const fallback='Workspace member';
 const profileName=()=>{const name=connection?.profile?.().name;return typeof name==='string'&&name.trim()&&!name.includes('@')?name.trim().slice(0,60):fallback;};
 const message=text=>{if(settings)settings.querySelector('[data-photo-message]').textContent=text;};
 async function token(){const current=connection,gen=generation,t=await current?.token();if(current!==connection||gen!==generation)throw Error('The signed-in account changed.');if(t)lastToken=t;return t;}
 async function request(endpoint,method='GET',body){
  const gen=generation,t=await token();if(!t)throw Error('Sign in again before changing your profile.');
  const r=await fetch(endpoint,{method,headers:{Authorization:'Bearer '+t,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(8000),cache:'no-store'});
  if(!r.ok){let data;try{data=await r.json();}catch{}if([401,403].includes(r.status)&&gen===generation)await disconnect({keepalive:true});throw Object.assign(Error(data?.error||'Member information is unavailable.'),{status:r.status});}return r;
 }
 function revokePhotos(){for(const p of photos.values())URL.revokeObjectURL(p.url);photos.clear();requests.clear();ownPhoto='';}
 function discard(){selectionId++;if(pending?.url)URL.revokeObjectURL(pending.url);pending=null;}
 async function photo(id,version){
  if(!version)return '';
  const cached=photos.get(id),key=id+'|'+version;if(cached?.version===version)return cached.url;if(requests.has(key))return requests.get(key);
  const gen=generation;
  const promise=(async()=>{try{
   const r=await request('/api/member-photo?member='+encodeURIComponent(id));if(r.headers.get('Content-Type')?.split(';')[0]!=='image/png')throw Error('Invalid profile photo.');const b=await r.blob();if(b.size>300000)throw Error('Invalid profile photo.');
   if(gen!==generation)return '';const url=URL.createObjectURL(b);if(cached)URL.revokeObjectURL(cached.url);photos.set(id,{url,version});if(identity?.memberKey===id)ownPhoto=url;emit();return url;
  }catch{return '';}finally{if(requests.get(key)===promise)requests.delete(key);}})();requests.set(key,promise);return promise;
 }
 async function loadProfile(){
  const gen=generation,r=await request('/api/member-profile'),p=await r.json();if(gen!==generation)return;
  const url=p.photoVersion?await photo(p.memberKey,p.photoVersion):'';if(gen!==generation)return;identity=p;photoVersion=p.photoVersion;profileReady=true;available=true;ownPhoto=url;photoLoadFailed=Boolean(p.photoVersion&&!url);if(photoLoadFailed)message('Your saved photo could not be loaded. Reload the photo to retry.');emit();
 }
 async function refreshRoster(append=false){
  if(!connection)return;const gen=generation,cursor=append?nextCursor:null;
  try{const r=await request('/api/member-presence'+(cursor?'?cursor='+encodeURIComponent(cursor):'')),p=await r.json();if(gen!==generation)return;
   available=true;roster=append?[...roster,...p.members]:p.members;nextCursor=p.nextCursor;if(dialog?.open)for(const m of p.members)if(m.photoVersion)photo(m.id,m.photoVersion);emit();
  }catch{if(gen===generation){available=false;ownState='unknown';roster=roster.map(m=>({...m,state:'unknown'}));emit();}}
 }
 async function heartbeat(){
  if(!connection||!sessionId||beating.has(sessionId))return;const gen=generation,id=sessionId;beating.add(id);
  try{const r=await request('/api/member-presence','PUT',{sessionId:id,name:profileName()}),p=await r.json();if(gen!==generation||id!==sessionId)return;
   ownState='online';available=true;if(identity&&identity.memberKey!==p.memberKey){revokePhotos();profileReady=false;}if(!profileReady||p.photoVersion!==photoVersion)await loadProfile();if(dialog?.open)await refreshRoster();
  }catch(e){if(gen!==generation)return;ownState='unknown';available=false;roster=roster.map(m=>({...m,state:'unknown'}));emit();if(e.status===409){sessionId=crypto.randomUUID();setTimeout(()=>heartbeat(),100);}}
  finally{beating.delete(id);}emit();
 }
 async function start(){
  if(!connection)return;const gen=generation;sessionId=crypto.randomUUID();ownState='unknown';available=false;profileReady=false;clearInterval(timer);timer=setInterval(()=>heartbeat(),30000);emit();
  try{await loadProfile();}catch{available=false;profileReady=false;message('Profile storage is unavailable. Your current photo is unchanged.');emit();}
  if(gen===generation)await heartbeat();
 }
 async function endSession(id,t,keepalive=false){
  if(!id||!t)return;try{await fetch('/api/member-presence',{method:'DELETE',headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({sessionId:id}),keepalive,signal:keepalive?undefined:AbortSignal.timeout(2500),cache:'no-store'});}catch{}
 }
 async function disconnect(options={}){
  const id=sessionId,t=lastToken;generation++;connection=null;sessionId=null;lastToken='';clearInterval(timer);timer=null;identity=null;profileReady=false;photoVersion=null;ownState='unknown';available=false;roster=[];nextCursor=null;discard();revokePhotos();dialog?.close();emit();await endSession(id,t,Boolean(options.keepalive));
 }
 function connect(value){
  if(!value?.id||typeof value.token!=='function')return;
  if(connection?.id===value.id){connection=value;return;}
  const previousId=sessionId,previousToken=lastToken;generation++;clearInterval(timer);discard();revokePhotos();connection=value;identity=null;photoVersion=null;profileReady=false;ownState='unknown';roster=[];nextCursor=null;lastToken='';endSession(previousId,previousToken);start();
 }
 function dimensions(b){
  const u=new Uint8Array(b),v=new DataView(b),s=(p,n)=>String.fromCharCode(...u.slice(p,p+n));
  if(u.length>=24&&u[0]===137&&s(1,3)==='PNG'&&s(12,4)==='IHDR')return [v.getUint32(16),v.getUint32(20)];
  if(u[0]===255&&u[1]===216){let p=2;while(p+4<=u.length){if(u[p++]!==255)break;const m=u[p++],n=v.getUint16(p);if(n<2||p+n>u.length)break;if([192,193,194].includes(m)&&n>=7)return[v.getUint16(p+5),v.getUint16(p+3)];p+=n;}}
  if(u.length>=30&&s(0,4)==='RIFF'&&s(8,4)==='WEBP'){
   const type=s(12,4);if(type==='VP8X'){if(u[20]&2)throw Error('Choose a still image.');return[1+u[24]+(u[25]<<8)+(u[26]<<16),1+u[27]+(u[28]<<8)+(u[29]<<16)];}
   if(type==='VP8 '&&u[23]===157&&u[24]===1&&u[25]===42)return[v.getUint16(26,true)&16383,v.getUint16(28,true)&16383];
   if(type==='VP8L'&&u[20]===47){const n=v.getUint32(21,true);return[(n&16383)+1,((n>>>14)&16383)+1];}
  }
  throw Error('Choose a PNG, JPEG or WebP image. SVG and other file types are not accepted.');
 }
 async function prepare(file){
  if(!file||file.size>6000000||!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Choose a PNG, JPEG or WebP image smaller than 6 MB.');
  const bytes=await file.arrayBuffer(),[w,h]=dimensions(bytes);if(!w||!h||w>8192||h>8192||w*h>16000000)throw Error('Choose an image with at most 16 million pixels and no side above 8,192 pixels.');
  const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});try{
   const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d'),side=Math.min(bitmap.width,bitmap.height);ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,256,256);
   const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob||blob.size>300000)throw Error('This photo could not be prepared. Choose another image.');
   const png=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});return{png,url:URL.createObjectURL(blob)};
  }finally{bitmap.close();}
 }
 function avatar(name,url,large=false){const span=document.createElement('span');span.className='member-avatar'+(large?' large':'');span.setAttribute('aria-hidden','true');if(url){const img=document.createElement('img');img.src=url;img.alt='';span.append(img);}else span.textContent=(name||fallback).slice(0,1).toUpperCase();return span;}
 function trapFocus(parent){
  parent.addEventListener('keydown',e=>{if(e.key!=='Tab'||!parent.open)return;
   const controls=[...parent.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')].filter(node=>node.getClientRects().length&&!node.closest('[inert]'));
   if(!controls.length)return;const current=controls.indexOf(document.activeElement),next=current<0?(e.shiftKey?controls.length-1:0):(current+(e.shiftKey?-1:1)+controls.length)%controls.length;e.preventDefault();controls[next].focus();
  });
 }
 function renderSettings(){
  if(!settings)return;settings.hidden=!connection;const preview=settings.querySelector('[data-photo-preview]');preview.replaceChildren(avatar(profileName(),pending?.url||ownPhoto,true));
  settings.querySelector('[data-photo-choose]').disabled=busy||!profileReady;settings.querySelector('[data-photo-save]').hidden=!pending;settings.querySelector('[data-photo-save]').disabled=busy||!profileReady;settings.querySelector('[data-photo-cancel]').hidden=!pending;settings.querySelector('[data-photo-cancel]').disabled=busy;settings.querySelector('[data-photo-remove]').disabled=busy||!photoVersion||!profileReady;settings.querySelector('[data-photo-reload]').hidden=profileReady&&!photoLoadFailed;
 }
 async function save(remove=false){
  if(busy||!profileReady||(!remove&&!pending))return;busy=true;renderSettings();message(remove?'Removing photo…':'Saving photo…');const gen=generation;
  try{const r=await request('/api/member-profile',remove?'DELETE':'PUT',{expectedVersion:remove?photoVersion:pending.expectedVersion,...(!remove?{png:pending.png}:{})}),p=await r.json();if(gen!==generation)return;
   discard();revokePhotos();photoVersion=p.photoVersion;identity={...identity,photoVersion};const url=photoVersion?await photo(identity.memberKey,photoVersion):'';if(gen!==generation)return;ownPhoto=url;photoLoadFailed=Boolean(photoVersion&&!url);message(remove?'Photo removed.':photoLoadFailed?'Photo saved, but its preview is unavailable. Reload the photo to retry.':'Photo saved.');await refreshRoster();
  }catch(e){if(gen===generation){message(e.message+' Your previous photo is unchanged.');if(e.status===409){profileReady=false;discard();}}}
  finally{busy=false;emit();}
 }
 function mountSettings(parent){
  trapFocus(parent);
  settings=document.createElement('section');settings.className='account-photo-settings';settings.setAttribute('aria-labelledby','account-photo-heading');settings.innerHTML='<h3 id="account-photo-heading">Profile photo</h3><div class="account-photo-controls"><div data-photo-preview></div><div><button type="button" data-photo-choose>Choose photo</button><button type="button" data-photo-remove>Remove photo</button></div></div><input type="file" accept="image/png,image/jpeg,image/webp" data-photo-file hidden><p class="small">PNG, JPEG or WebP · Up to 6 MB. Review the square crop before saving. Only the small avatar is stored; location metadata is removed.</p><div class="account-photo-actions"><button type="button" data-photo-save>Save photo</button><button type="button" data-photo-cancel>Cancel</button><button type="button" data-photo-reload>Reload current photo</button></div><p role="status" data-photo-message></p>';parent.querySelector('#account-current-info').after(settings);
  const file=settings.querySelector('[data-photo-file]');settings.querySelector('[data-photo-choose]').onclick=()=>file.click();file.onchange=async()=>{const chosen=file.files[0];file.value='';if(!chosen)return;discard();busy=true;renderSettings();message('Preparing preview…');const gen=generation,choice=selectionId,expectedVersion=photoVersion;try{const prepared=await prepare(chosen);if(gen===generation&&choice===selectionId&&parent.open){pending={...prepared,expectedVersion};message('Preview ready. Save photo to apply it.');}else URL.revokeObjectURL(prepared.url);}catch(e){if(gen===generation&&choice===selectionId)message(e.message);}finally{busy=false;renderSettings();}};
  settings.querySelector('[data-photo-save]').onclick=()=>save();settings.querySelector('[data-photo-remove]').onclick=()=>save(true);settings.querySelector('[data-photo-cancel]').onclick=()=>{discard();message('Photo change cancelled.');renderSettings();};settings.querySelector('[data-photo-reload]').onclick=async()=>{try{await loadProfile();if(!photoLoadFailed)message('Current photo loaded.');}catch{message('Profile storage is unavailable. Try again later.');}};parent.addEventListener('close',()=>{discard();renderSettings();});renderSettings();
 }
 function renderRoster(){
  if(!dialog)return;const list=dialog.querySelector('[data-member-list]'),q=dialog.querySelector('input').value.toLowerCase();list.replaceChildren();const members=roster.filter(m=>m.name.toLowerCase().includes(q));
  for(const m of members){const row=document.createElement('li'),name=document.createElement('strong'),state=document.createElement('span');name.textContent=m.name+(m.self?' (you)':'');state.className='member-presence '+m.state;state.textContent=m.state==='online'?'Online':m.state==='offline'?'Offline':'Unknown';row.append(avatar(m.name,photos.get(m.id)?.url),name,state);list.append(row);}
  dialog.querySelector('[data-member-status]').textContent=!available?'Presence is unavailable. Connection states are unknown.':members.length?`${members.length} members shown${nextCursor?' · More members available':''}`:'No matching members.';dialog.querySelector('[data-member-more]').hidden=!nextCursor;dialog.querySelector('[data-member-refresh]').disabled=!connection;
 }
 function mountToolbar(toolbar){
  const button=document.createElement('button');button.type='button';button.id='atlas-members-open';button.setAttribute('aria-label','Workspace members and connection status');button.setAttribute('aria-haspopup','dialog');button.innerHTML=icon('users')+'<span>Members</span>';toolbar.querySelector('.nav-tools').prepend(button);
  dialog=document.createElement('dialog');dialog.className='atlas-members-dialog';dialog.setAttribute('aria-labelledby','atlas-members-title');dialog.innerHTML='<header><h2 id="atlas-members-title">Workspace members</h2><form method="dialog"><button aria-label="Close workspace members">Close</button></form></header><p>Members who have signed in since this feature was enabled. Online means a recent connection; closed or disconnected sessions expire within two minutes. Another active tab or device keeps a member online.</p><label for="atlas-member-search">Find a member</label><input type="search" id="atlas-member-search" placeholder="Search by name"><ul data-member-list></ul><p role="status" data-member-status></p><div class="member-actions"><button type="button" data-member-refresh>Refresh</button><button type="button" data-member-more>Load more</button></div>';document.body.append(dialog);
  trapFocus(dialog);button.onclick=()=>{trigger=button;dialog.showModal();renderRoster();refreshRoster();};dialog.querySelector('input').oninput=renderRoster;dialog.querySelector('[data-member-refresh]').onclick=()=>refreshRoster();dialog.querySelector('[data-member-more]').onclick=()=>refreshRoster(true);dialog.addEventListener('close',()=>trigger?.focus());document.addEventListener('atlas-members-change',()=>{button.hidden=!connection;});button.hidden=!connection;renderRoster();
 }
 addEventListener('offline',()=>{available=false;ownState='unknown';roster=roster.map(m=>({...m,state:'unknown'}));emit();});addEventListener('online',()=>heartbeat());document.addEventListener('visibilitychange',()=>{if(!document.hidden)heartbeat();});
 addEventListener('pagehide',()=>{clearInterval(timer);const id=sessionId;sessionId=null;generation++;profileReady=false;ownState='unknown';available=false;discard();revokePhotos();endSession(id,lastToken,true);emit();});addEventListener('pageshow',e=>{if(e.persisted&&connection)start();});
 window.AtlasMembers={connect,disconnect,mountSettings,mountToolbar,avatar,refresh:()=>{loadProfile().catch(()=>{});heartbeat();},get current(){return {signedIn:Boolean(connection),name:profileName(),photo:ownPhoto,state:ownState,available,photoVersion};}};
})();
