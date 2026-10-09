/* Informational pages share the existing Firebase session without loading a planning document. */
(() => {
  if(self!==top||window.AtlasTeam)return;
  const button=document.createElement('button');button.id='atlas-account-control';button.type='button';button.textContent='Sign in';button.setAttribute('aria-label','Sign in to Atlas');document.body.append(button);
  let configured=false,current={active:false};
  const update=()=>{const profile=window.AtlasFirebaseAuth.profile();current={active:Boolean(profile?.verified),email:profile?.email||'',name:profile?.name||'',role:'Verified email'};button.title=current.active?current.email:'Sign in to Atlas';button.textContent=current.active?'Account':'Sign in';if(current.active)window.AtlasMembers?.connect({id:profile.id,token:()=>window.AtlasFirebaseAuth.token(),profile:()=>window.AtlasFirebaseAuth.profile()});else window.AtlasMembers?.disconnect({keepalive:true});window.AtlasSidebar?.schedule();};
  window.AtlasPageAccount={get current(){return {...current};},async signOut(){await window.AtlasMembers?.disconnect();await window.AtlasFirebaseAuth.signOut();update();}};
  button.onclick=async()=>{await ready;if(!configured){button.title='Sign-in is disabled in this isolated preview.';return;}await window.AtlasFirebaseAuth.ensureSignedIn();update();};
  const ready=fetch('/api/team-config').then(r=>r.json()).then(async config=>{if(!config.enabled||config.provider!=='firebase')return;await window.AtlasFirebaseAuth.init(config.firebase,config.verifiedEditors);configured=true;window.AtlasFirebaseAuth.listen(update);update();}).catch(()=>{button.title='Sign-in is currently unavailable.';});
})();
