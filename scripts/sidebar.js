/* Navigation and account presentation only. Never writes a planning record or browser storage. */
(() => {
  if(self!==top)return;
  const prefix=location.pathname.includes('/venue/')?'../':'';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reviews=[['progress','Progress'],['owners','Ownership'],['recruitment','Recruitment'],['dependencies','Dependencies'],['decisions','Decisions'],['publication','Website readiness']];
  const ops=[['direction','Operations overview'],['outcomes','Event outcomes'],['notebook','Operations register'],['web','Website content'],['transport','Transport'],['open','Follow-up actions'],['exec','Leadership review'],['story','Event background'],['baseline','Planning baseline'],['mobilize','Team mobilisation'],['refs','Source references']];
  const people=[['directory','Directory'],['stakeholders','Stakeholders'],['map','Communication map'],['schools','Schools & institutions']];
  const toolbar=document.createElement('header');toolbar.id='atlas-toolbar';toolbar.className='mission-nav';toolbar.dataset.readable='true';
  toolbar.innerHTML='<button type="button" id="atlas-menu-toggle" aria-controls="atlas-sidebar" aria-expanded="false" aria-label="Open navigation"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button><div class="toolbar-context"><span>ATLAS / 2027</span><strong id="atlas-current-page">Planner</strong></div><div class="nav-tools"></div>';
  const sidebar=document.createElement('aside');sidebar.id='atlas-sidebar';sidebar.setAttribute('aria-label','Atlas navigation');
  sidebar.innerHTML=`<div class="sidebar-brand"><a href="${prefix}index.html" aria-label="Atlas home"><img src="${prefix}assets/intellibus-logo.svg" alt="Intellibus" width="140" height="27"></a><button type="button" id="atlas-menu-close" aria-label="Close navigation">×</button></div><p class="sidebar-caption">ATLAS · JAMAICA 2027</p><nav id="atlas-sidebar-links" aria-label="Planner pages and views"></nav><p class="sidebar-footnote">23–24 January · Montego Bay<br>Planning records & working proposals</p>`;
  const backdrop=document.createElement('button');backdrop.id='atlas-sidebar-backdrop';backdrop.type='button';backdrop.setAttribute('aria-label','Close navigation');backdrop.tabIndex=-1;
  document.body.prepend(toolbar,sidebar,backdrop);
  const toggle=toolbar.querySelector('button'),close=sidebar.querySelector('button'),links=sidebar.querySelector('nav');
  let open=innerWidth>900,key='',scheduled=false,pendingFocus=false;
  const groups={},inert=new Map();
  const accountState=()=>window.AtlasTeam?{active:window.AtlasTeam.active,email:document.getElementById('atlas-account-control')?.title||'',role:window.AtlasTeam.readOnly?'View only':window.AtlasTeam.canAdmin()?'Owner':'Editor'}:window.AtlasPageAccount?.current||{active:false};
  function modal(){return innerWidth<=900;}
  function setOpen(next,focus=false){
    const changed=open!==next;
    open=next;document.body.dataset.sidebarOpen=String(open);sidebar.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');backdrop.hidden=!(open&&modal());
    if(open&&modal()){
      sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');
      for(const node of document.body.children)if(![sidebar,backdrop].includes(node)&&!['SCRIPT','STYLE','LINK'].includes(node.tagName)){if(!inert.has(node))inert.set(node,node.inert);node.inert=true;}
    }else{sidebar.removeAttribute('role');sidebar.removeAttribute('aria-modal');for(const [node,value] of inert)node.inert=value;inert.clear();}
    if(focus)(open?close:toggle).focus();
    if(changed)setTimeout(()=>dispatchEvent(new Event('resize')),260);
  }
  toggle.onclick=()=>setOpen(!open,true);close.onclick=()=>setOpen(false,true);backdrop.onclick=()=>setOpen(false,true);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&open&&!document.querySelector('dialog[open]')){e.preventDefault();setOpen(false,true);}
    if(e.key==='Tab'&&open&&modal()){
      const all=[...sidebar.querySelectorAll('a[href],button:not(:disabled),summary,[tabindex="0"]')].filter(x=>x.getClientRects().length);
      if(e.shiftKey&&document.activeElement===all[0]){e.preventDefault();all.at(-1).focus();}
      else if(!e.shiftKey&&document.activeElement===all.at(-1)){e.preventDefault();all[0].focus();}
    }
  });
  addEventListener('resize',()=>setOpen(open));
  links.addEventListener('click',e=>{if(e.target.closest('a[href]')){pendingFocus=true;if(modal())setOpen(false);schedule();}});
  links.addEventListener('toggle',e=>{if(e.target.matches('details[data-group]'))groups[e.target.dataset.group]=e.target.open;},true);
  const link=(url,label,sub=false)=>{const target=/^https?:/.test(url)?url:prefix+url;const u=new URL(target,location.href);const here=location.pathname===u.pathname||(u.pathname.endsWith('/index.html')&&location.pathname.endsWith('/'));let current=here&&location.hash===u.hash;if(url==='atlas-reference.html#people/directory'&&here&&location.hash==='#people')current=true;return `<a class="sidebar-link${sub?' sidebar-sub':''}" href="${esc(target)}" ${/^https?:/.test(url)?'target="_blank" rel="noopener noreferrer"':''} ${current?'aria-current="page"':''}><span class="sidebar-disc" aria-hidden="true"></span><span>${esc(label)}</span>${current?'<span class="sidebar-current" aria-hidden="true">●</span>':''}</a>`;};
  const group=(id,label,body,defaultOpen=false)=>`<details data-group="${id}" ${(groups[id]??defaultOpen)?'open':''}><summary>${esc(label)}<span aria-hidden="true">+</span></summary><div>${body}</div></details>`;
  function refresh(){
    scheduled=false;
    // Capture native disclosure state before a route/render update rebuilds links.
    // The asynchronous toggle event can otherwise arrive after a rebuild.
    links.querySelectorAll('details[data-group]').forEach(detail=>{groups[detail.dataset.group]=detail.open;});
    const account=document.getElementById('atlas-account-control'),theme=document.getElementById('atlas-theme-toggle'),tools=toolbar.querySelector('.nav-tools');
    for(const node of [account,theme])if(node&&node.parentElement!==tools)tools.append(node);
    if(account&&accountState().active){const email=accountState().email;if(account.dataset.profileEmail!==email||!account.querySelector('.account-avatar')){account.dataset.profileEmail=email;account.innerHTML=`<span class="account-avatar" aria-hidden="true">${esc(email.slice(0,1).toUpperCase())}</span><span class="sr-only">Account settings</span>`;}account.setAttribute('aria-label','Open account settings');account.setAttribute('aria-haspopup','dialog');}
    else if(account){account.removeAttribute('aria-haspopup');account.setAttribute('aria-label','Sign in to Atlas');delete account.dataset.profileEmail;}
    const planner=window.AtlasPlannerNavigation,ctx=planner?.context(),workstreams=planner?.workstreams()||[],operations=window.AtlasOperationsNavigation?.workstreams()||[];
    let workspace=link('workspace.html','Workspace overview',true)+reviews.map(([id,label])=>link('workspace.html#review/'+id,label,true)).join('');
    if(planner){workspace+=group('areas','Planning areas',planner.areas().map(a=>link('workspace.html#area/'+encodeURIComponent(a.id),a.title,true)).join(''));workspace+=group('workstreams','Planning workstreams',workstreams.map(w=>link('workspace.html#workstream/'+encodeURIComponent(w.id)+'/list',w.title,true)).join(''),!!ctx?.wsId);}
    const selected=workstreams.find(w=>w.id===ctx?.wsId);
    if(selected)workspace+=group('current-workstream',selected.title,[['list','Lists'],['organize','Organize lists'],['validate','Check lists'],['execute','Work to finish']].map(([id,label])=>link('workspace.html#workstream/'+encodeURIComponent(selected.id)+'/'+id,label,true)).join('')+group('lists','Workstream lists',selected.lists.map(l=>link('workspace.html#list/'+encodeURIComponent(selected.id)+'/'+encodeURIComponent(l.id),l.title,true)).join(''),ctx.screen==='list'),true);
    let operationLinks=ops.map(([id,label])=>link('atlas-reference.html#'+id,label,true)).join('');
    if(operations.length)operationLinks+=group('operation-workstreams','Workstream plans',link('atlas-reference.html#notebook/prizes','Prizes & recognition',true)+operations.map(w=>link('atlas-reference.html#notebook/'+encodeURIComponent(w.id),w.title,true)).join(''),document.body.dataset.section==='notebook');
    if(document.body.dataset.section==='web'){const items=window.AtlasOperationsNavigation?.webAreas()||[];operationLinks+=group('web-content','Content areas',items.map(x=>link('atlas-reference.html#web/'+encodeURIComponent(x.id),x.title,true)).join(''),true);}
    const html=link('index.html','Home')+group('workspace','Planning workspace',workspace,location.pathname.endsWith('workspace.html'))+group('operations','Operations & delivery',operationLinks,location.pathname.endsWith('atlas-reference.html')&&document.body.dataset.section!=='people')+group('people','People',people.map(([id,label])=>link('atlas-reference.html#people/'+id,label,true)).join(''),document.body.dataset.section==='people')+link('atlas-reference.html#transport','Transport')+group('venue','Venue',link('virtual-walkthrough.html','Virtual walkthrough',true)+link('venue/index.html','Venue explorer',true)+link('https://virtualtour.mbconventioncentre.com/','Original venue tour ↗',true),/venue|walkthrough/.test(location.pathname))+link('assistant.html','Atlas Tech assistant');
    if(key!==html){key=html;links.innerHTML=html;}
    const title=location.pathname.endsWith('/venue/index.html')?'Venue explorer':location.pathname.endsWith('virtual-walkthrough.html')?'Virtual walkthrough':location.pathname.endsWith('assistant.html')?'Atlas Tech assistant':location.pathname.endsWith('index.html')||location.pathname.endsWith('/')?'Home':document.querySelector('#read-section-guide h1,.workspace-heading h1,.compact-heading h1')?.textContent||'Atlas planner';
    if(toolbar.querySelector('strong').textContent!==title)toolbar.querySelector('strong').textContent=title;
    if(pendingFocus){pendingFocus=false;requestAnimationFrame(()=>{const main=document.getElementById('read-main')||document.querySelector('#read-section-guide,.workspace-shell,.planning-surface,.readable-home');if(main){main.tabIndex=-1;main.focus({preventScroll:true});}});}
    if(open&&modal())setOpen(true);
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(refresh);}}
  // The original account button and sign-out action retain all authentication guards.
  const dialog=document.createElement('dialog');dialog.id='atlas-account-settings';dialog.setAttribute('aria-labelledby','account-settings-title');
  dialog.innerHTML='<form method="dialog"><button aria-label="Close account settings">×</button></form><p class="read-eyebrow">YOUR ACCOUNT</p><h2 id="account-settings-title">Account settings</h2><div id="account-current-info"></div><p>Shared edits use this signed-in account. Personal browser drafts remain separate.</p><button type="button" id="account-appearance">Change light / dark mode</button><button type="button" id="account-logout">Sign out</button>';
  document.body.append(dialog);
  document.addEventListener('click',e=>{if(e.target.closest('#atlas-account-control')&&accountState().active){e.preventDefault();e.stopImmediatePropagation();const state=accountState();dialog.querySelector('#account-current-info').innerHTML=`<p><strong>Email</strong><br>${esc(state.email)}</p><p><strong>${window.AtlasTeam?'Planner access':'Account status'}</strong><br>${esc(state.role)}</p>`;dialog.showModal();}},true);
  dialog.querySelector('#account-appearance').onclick=()=>document.getElementById('atlas-theme-toggle')?.click();
  dialog.querySelector('#account-logout').onclick=()=>{dialog.close();if(window.AtlasTeam)document.querySelector('#team-bar [data-team-leave]')?.click();else window.AtlasPageAccount?.signOut();};
  dialog.addEventListener('close',()=>document.getElementById('atlas-account-control')?.focus());
  window.AtlasSidebar={refresh,schedule,open:()=>setOpen(true,true)};
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-section']});addEventListener('hashchange',schedule);addEventListener('popstate',schedule);
  setOpen(open);refresh();
})();
