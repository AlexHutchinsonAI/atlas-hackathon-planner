/* Navigation and account presentation only. Never writes a planning record or browser storage. */
(() => {
  if(self!==top)return;
  const prefix=location.pathname.includes('/venue/concept/')?'../../':location.pathname.includes('/venue/')?'../':'';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=window.AtlasIcon;
  const reviews=[['progress','Progress'],['owners','Ownership'],['recruitment','Recruitment'],['dependencies','Dependencies'],['decisions','Decisions'],['publication','Website readiness']];
  const ops=[['direction','Operations overview'],['outcomes','Event outcomes'],['notebook','Operations register'],['web','Website content'],['transport','Transport'],['open','Follow-up actions'],['exec','Leadership review'],['story','Event background'],['baseline','Planning baseline'],['mobilize','Team mobilisation'],['refs','Source references']];
  const people=[['directory','Directory'],['stakeholders','Stakeholders'],['map','Communication map'],['schools','Schools & institutions']];
  const toolbar=document.createElement('header');toolbar.id='atlas-toolbar';toolbar.className='mission-nav';toolbar.dataset.readable='true';
  toolbar.innerHTML='<button type="button" id="atlas-menu-toggle" aria-controls="atlas-sidebar" aria-expanded="false" aria-label="Open navigation"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 4v16" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button><span class="toolbar-divider" aria-hidden="true"></span><nav class="toolbar-context" aria-label="Breadcrumb"><ol><li><a id="atlas-current-section" href="'+prefix+'index.html">Atlas</a></li><li><svg class="toolbar-chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><strong id="atlas-current-page" aria-current="page">Home</strong></li></ol></nav><div class="nav-tools"></div>';
  const sidebar=document.createElement('aside');sidebar.id='atlas-sidebar';sidebar.setAttribute('aria-label','Atlas navigation');
  sidebar.innerHTML=`<div class="sidebar-brand"><a href="${prefix}index.html" aria-label="Atlas home"><img src="${prefix}assets/intellibus-logo.svg" alt="Intellibus" width="140" height="27"></a><button type="button" id="atlas-menu-close" aria-label="Close navigation"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 4v16" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button></div><p class="sidebar-caption">ATLAS · JAMAICA 2027</p><nav id="atlas-sidebar-links" aria-label="Planner pages and views"></nav><p class="sidebar-footnote">23–24 January · Montego Bay<br>Planning records & working proposals</p>`;
  const backdrop=document.createElement('button');backdrop.id='atlas-sidebar-backdrop';backdrop.type='button';backdrop.setAttribute('aria-label','Close navigation');backdrop.tabIndex=-1;
  sidebar.querySelector('.sidebar-brand').innerHTML=`<a href="${prefix}index.html" aria-label="Atlas dashboard"><span class="brand-mark"><img src="${prefix}assets/intellibus-logo.svg" alt="Intellibus" width="166" height="31"></span><span class="brand-wordmark">ATLAS</span></a><button type="button" id="atlas-menu-close" aria-label="Collapse navigation">${icon('panel-left',18)}</button>`;
  sidebar.querySelector('.sidebar-caption').textContent='Hackathon planning · Jamaica 2027';
  sidebar.querySelector('.sidebar-footnote').remove();
  const footer=document.createElement('div');footer.className='sidebar-footer';
  footer.innerHTML=`<button type="button" id="atlas-sidebar-settings" title="Settings">${icon('settings',18)}<span>Settings</span></button><button type="button" id="atlas-sidebar-help" title="Help & tutorial">${icon('circle-help',18)}<span>Help & tutorial</span></button><button type="button" id="atlas-sidebar-profile" class="sidebar-profile">${icon('log-in',18)}<span>Sign in<small>Open the shared team plan</small></span></button><p class="sidebar-footnote">23–24 January · Montego Bay<img src="${prefix}assets/intellibus-logo.svg" alt="Intellibus" width="98" height="19"></p>`;
  sidebar.append(footer);
  const searchButton=document.createElement('button');searchButton.type='button';searchButton.className='toolbar-search';searchButton.id='atlas-search-open';searchButton.setAttribute('aria-haspopup','dialog');searchButton.setAttribute('aria-label','Find pages and planning views');searchButton.innerHTML=`${icon('search',17)}<span>Find pages & views</span><kbd>⌘ K</kbd>`;toolbar.querySelector('.nav-tools').prepend(searchButton);
  document.body.prepend(toolbar,sidebar,backdrop);
  window.AtlasMembers?.mountToolbar(toolbar);
  const toggle=toolbar.querySelector('button'),close=sidebar.querySelector('button'),links=sidebar.querySelector('nav');
  let open=innerWidth>900,key='',scheduled=false,pendingFocus=false;
  const groups={},inert=new Map();
  const accountState=()=>{
    if(!window.AtlasTeam)return window.AtlasPageAccount?.current||{active:false};
    if(window.AtlasTeam.active)return {active:true,email:document.getElementById('atlas-account-control')?.title||'',role:window.AtlasTeam.readOnly?'View only':window.AtlasTeam.canAdmin()?'Owner':'Editor'};
    if(window.AtlasMembers?.current.signedIn)return {active:true,email:window.AtlasFirebaseAuth?.profile()?.email||window.Clerk?.user?.primaryEmailAddress?.emailAddress||'',role:'Shared plan not connected'};
    return {active:false};
  };
  function modal(){return innerWidth<=900;}
  function setOpen(next,focus=false){
    const changed=open!==next,wasModal=sidebar.hasAttribute('aria-modal');
    open=next;document.body.dataset.sidebarOpen=String(open);sidebar.hidden=!open&&modal();toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?(modal()?'Close navigation':'Collapse navigation'):'Open navigation');close.setAttribute('aria-label',modal()?'Close navigation':'Collapse navigation');backdrop.hidden=!(open&&modal());
    if(open&&modal()){
      sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');
      document.dispatchEvent(new Event('atlas-navigation-change'));
      // Help moves into the active drawer; restore it before trapping background content.
      for(const [node,value] of inert)if(sidebar.contains(node)){node.inert=value;inert.delete(node);}
      for(const node of document.body.children)if(![sidebar,backdrop].includes(node)&&!['SCRIPT','STYLE','LINK'].includes(node.tagName)){if(!inert.has(node))inert.set(node,node.inert);node.inert=true;}
    }else{sidebar.removeAttribute('role');sidebar.removeAttribute('aria-modal');for(const [node,value] of inert)node.inert=value;inert.clear();document.dispatchEvent(new Event('atlas-navigation-change'));}
    if(focus||(open&&wasModal!==modal()&&!document.querySelector('dialog[open]')))(open&&modal()?close:toggle).focus();
    if(changed)setTimeout(()=>dispatchEvent(new Event('resize')),260);
  }
  toggle.onclick=()=>setOpen(!open,true);close.onclick=()=>setOpen(false,true);backdrop.onclick=()=>setOpen(false,true);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&open&&!document.querySelector('dialog[open]')){e.preventDefault();setOpen(false,true);}
    if(e.key==='Tab'&&open&&modal()&&!document.querySelector('dialog[open]')){
      const all=[],collect=root=>{for(const node of root.querySelectorAll('*'))if(!node.closest('[inert]')){if(node.matches('a[href],button:not(:disabled),summary,[tabindex="0"]')&&node.getClientRects().length)all.push(node);if(node.shadowRoot)collect(node.shadowRoot);}};collect(sidebar);
      let active=document.activeElement;while(active?.shadowRoot?.activeElement)active=active.shadowRoot.activeElement;
      // Explicitly cycle links and controls, including WebKit's limited native Tab order.
      if(all.length){const index=all.indexOf(active),next=index<0?(e.shiftKey?all.length-1:0):(index+(e.shiftKey?-1:1)+all.length)%all.length;e.preventDefault();all[next].focus();}
    }
  });
  addEventListener('resize',()=>setOpen(open));
  links.addEventListener('click',e=>{if(e.target.closest('a[href]')){pendingFocus=true;if(modal())setOpen(false);schedule();}});
  links.addEventListener('toggle',e=>{if(e.target.matches('details[data-group]'))groups[e.target.dataset.group]=e.target.open;},true);
  const link=(url,label,sub=false,shape='file-text')=>{const target=/^https?:/.test(url)?url:prefix+url;const u=new URL(target,location.href);const here=location.pathname===u.pathname||(u.pathname.endsWith('/index.html')&&location.pathname.endsWith('/'));let current=here&&location.hash===u.hash;if(url==='atlas-reference.html#people/directory'&&here&&location.hash==='#people')current=true;return `<a class="sidebar-link${sub?' sidebar-sub':''}" href="${esc(target)}" title="${esc(label)}" data-tooltip="${esc(label)}" ${/^https?:/.test(url)?'target="_blank" rel="noopener noreferrer"':''} ${current?'aria-current="page"':''}>${icon(shape,18)}<span>${esc(label)}</span>${current?'<span class="sidebar-current" aria-hidden="true">●</span>':''}</a>`;};
  const group=(id,label,body,defaultOpen=false)=>`<details data-group="${id}" ${(groups[id]??defaultOpen)?'open':''}><summary>${icon(({workspace:'clipboard-list',operations:'panels-top-left',people:'users',venue:'map-pin',areas:'building-2',workstreams:'list-todo'})[id]||'file-text',18)}<span>${esc(label)}</span>${icon('chevron-right',14).replace('atlas-icon','atlas-icon sidebar-chevron')}</summary><div>${body}</div></details>`;
  function pageContext(planner,ctx,selected,operations){
    const path=location.pathname;
    if(path.endsWith('/venue/concept/index.html'))return ['Venue tours','venue-tours.html','AI Concept Tour'];
    if(path.endsWith('venue-tours.html'))return ['Atlas','index.html','Venue tours'];
    if(path.endsWith('/venue/index.html'))return ['Venue','virtual-walkthrough.html','Venue explorer'];
    if(path.endsWith('virtual-walkthrough.html'))return ['Venue','virtual-walkthrough.html','Virtual walkthrough'];
    if(path.endsWith('assistant.html'))return ['Atlas','index.html','Atlas Tech assistant'];
    if(path.endsWith('workspace.html')||(planner&&ctx?.screen!=='home')){
      if(selected&&ctx.screen==='list')return [selected.title,'workspace.html#workstream/'+encodeURIComponent(selected.id)+'/list',selected.lists.find(l=>l.id===ctx.listId)?.title||'List'];
      if(selected&&ctx.screen==='workstream')return [selected.title,'workspace.html#workstream/'+encodeURIComponent(selected.id)+'/list',({list:'Lists',organize:'Organize lists',validate:'Check lists',execute:'Work to finish'})[ctx.mode]||'Lists'];
      if(ctx?.screen==='delivery')return ['Delivery review','workspace.html#review/progress',reviews.find(([id])=>id===window.AtlasReview?.currentTab())?.[1]||'Progress'];
      if(ctx?.screen==='area')return ['Planning workspace','workspace.html',planner.areas().find(a=>a.id===ctx.areaId)?.title||'Planning area'];
      return ['Planning workspace','workspace.html','Overview'];
    }
    if(path.endsWith('atlas-reference.html')){
      let route=[];try{route=location.hash.slice(1).split('/').map(decodeURIComponent);}catch{}
      const section=document.body.dataset.section||route[0]||'people';
      if(section==='people')return ['People','atlas-reference.html#people/directory',people.find(([id])=>id===(route[1]||'directory'))?.[1]||'Directory'];
      if(section==='web'&&route[1])return ['Website content','atlas-reference.html#web',window.AtlasOperationsNavigation?.webAreas().find(a=>a.id===route[1])?.title||'Content area'];
      if(section==='notebook'&&route[1])return ['Operations register','atlas-reference.html#notebook',route[1]==='prizes'?'Prizes & recognition':operations.find(w=>w.id===route[1])?.title||document.querySelector('#panel h2')?.textContent||'Workstream'];
      return ['Operations & delivery','atlas-reference.html#direction',ops.find(([id])=>id===section)?.[1]||'Operations overview'];
    }
    return ['Atlas','index.html','Dashboard'];
  }
  function refresh(){
    scheduled=false;
    // Capture native disclosure state before a route/render update rebuilds links.
    // The asynchronous toggle event can otherwise arrive after a rebuild.
    links.querySelectorAll('details[data-group]').forEach(detail=>{groups[detail.dataset.group]=detail.open;});
    const account=document.getElementById('atlas-account-control'),theme=document.getElementById('atlas-theme-toggle'),tools=toolbar.querySelector('.nav-tools');
    for(const node of [account,theme])if(node&&node.parentElement!==tools)tools.append(node);
    const member=window.AtlasMembers?.current;
    if(account&&accountState().active){const email=accountState().email,avatarKey=email+'|'+(member?.photo||'');if(account.dataset.profileEmail!==avatarKey||!account.querySelector('.account-avatar,.member-avatar')){account.dataset.profileEmail=avatarKey;account.innerHTML='<span class="sr-only">Account settings</span>';if(window.AtlasMembers)account.prepend(window.AtlasMembers.avatar(member.name,member.photo));else account.insertAdjacentHTML('afterbegin',`<span class="account-avatar" aria-hidden="true">${esc(email.slice(0,1).toUpperCase())}</span>`);}account.setAttribute('aria-label','Open account settings');account.setAttribute('aria-haspopup','dialog');}
    else if(account){if(account.querySelector('.account-avatar,.member-avatar'))account.textContent='Sign in';account.removeAttribute('aria-haspopup');account.setAttribute('aria-label','Sign in to Atlas');delete account.dataset.profileEmail;}
    const planner=window.AtlasPlannerNavigation,ctx=planner?.context(),workstreams=planner?.workstreams()||[],operations=window.AtlasOperationsNavigation?.workstreams()||[];
    let workspace=link('workspace.html','Workspace overview',true)+reviews.map(([id,label])=>link('workspace.html#review/'+id,label,true)).join('');
    if(planner){workspace+=group('areas','Planning areas',planner.areas().map(a=>link('workspace.html#area/'+encodeURIComponent(a.id),a.title,true)).join(''));workspace+=group('workstreams','Planning workstreams',workstreams.map(w=>link('workspace.html#workstream/'+encodeURIComponent(w.id)+'/list',w.title,true)).join(''),!!ctx?.wsId);}
    const selected=workstreams.find(w=>w.id===ctx?.wsId);
    if(selected)workspace+=group('current-workstream',selected.title,[['list','Lists'],['organize','Organize lists'],['validate','Check lists'],['execute','Work to finish']].map(([id,label])=>link('workspace.html#workstream/'+encodeURIComponent(selected.id)+'/'+id,label,true)).join('')+group('lists','Workstream lists',selected.lists.map(l=>link('workspace.html#list/'+encodeURIComponent(selected.id)+'/'+encodeURIComponent(l.id),l.title,true)).join(''),ctx.screen==='list'),true);
    let operationLinks=ops.map(([id,label])=>link('atlas-reference.html#'+id,label,true)).join('');
    if(operations.length)operationLinks+=group('operation-workstreams','Workstream plans',link('atlas-reference.html#notebook/prizes','Prizes & recognition',true)+operations.map(w=>link('atlas-reference.html#notebook/'+encodeURIComponent(w.id),w.title,true)).join(''),document.body.dataset.section==='notebook');
    if(document.body.dataset.section==='web'){const items=window.AtlasOperationsNavigation?.webAreas()||[];operationLinks+=group('web-content','Content areas',items.map(x=>link('atlas-reference.html#web/'+encodeURIComponent(x.id),x.title,true)).join(''),true);}
    const rail=[['workspace.html','Planning workspace','clipboard-list'],['workspace.html#review/progress','Delivery reviews','chart-no-axes-combined'],['atlas-reference.html#notebook','Operations register','panels-top-left'],['atlas-reference.html#people/directory','People directory','users'],['atlas-reference.html#transport','Transport','truck'],['venue-tours.html','Venue tours','map-pin'],['assistant.html','Atlas Tech assistant','bot']];
    const html=link('index.html','Dashboard',false,'layout-dashboard')+`<div class="sidebar-rail-links">${rail.map(([url,label,shape])=>link(url,label,false,shape)).join('')}</div><p class="sidebar-section-label">Plan & deliver</p>`+group('workspace','Planning workspace',workspace,location.pathname.endsWith('workspace.html'))+group('operations','Operations & delivery',operationLinks,location.pathname.endsWith('atlas-reference.html')&&document.body.dataset.section!=='people')+`<p class="sidebar-section-label">People & places</p>`+group('people','People',people.map(([id,label])=>link('atlas-reference.html#people/'+id,label,true)).join(''),document.body.dataset.section==='people')+link('atlas-reference.html#transport','Transport',false,'truck')+group('venue','Venue',link('venue-tours.html','Choose a venue tour',true)+link('virtual-walkthrough.html','Original Venue Tour',true)+link('venue/index.html','Venue explorer',true)+link('venue/concept/index.html','AI Concept Tour',true)+link('https://virtualtour.mbconventioncentre.com/','Venue source website ↗',true),/venue|walkthrough/.test(location.pathname))+`<p class="sidebar-section-label">Tools</p>`+link('assistant.html','Atlas Tech assistant',false,'bot');
    if(key!==html){key=html;links.innerHTML=html;}
    const [section,url,title]=pageContext(planner,ctx,selected,operations),sectionLink=toolbar.querySelector('#atlas-current-section'),pageLabel=toolbar.querySelector('#atlas-current-page');
    if(sectionLink.textContent!==section){sectionLink.textContent=section;sectionLink.title=section;}
    if(sectionLink.getAttribute('href')!==prefix+url)sectionLink.setAttribute('href',prefix+url);
    if(pageLabel.textContent!==title){pageLabel.textContent=title;pageLabel.title=title;}
    const state=accountState(),profile=footer.querySelector('#atlas-sidebar-profile');
    const memberStatus=member?.state==='online'?'Online':member?.state==='offline'?'Offline':'Connection unknown';
    const profileHTML=`${icon(state.active?'users':'log-in',18)}<span>${state.active?'Your account':'Sign in'}<small>${esc(state.active?state.email:'Open the shared team plan')}</small>${state.active&&member?`<span class="member-presence ${esc(member.state)}">${memberStatus}</span>`:''}</span>`;
    const profileKey=String(Boolean(state.active))+'|'+(state.email||'')+'|'+(member?.photo||'')+'|'+(member?.state||'');
    if(profile.dataset.profileKey!==profileKey){profile.dataset.profileKey=profileKey;profile.innerHTML=profileHTML;if(state.active&&window.AtlasMembers){profile.firstElementChild.replaceWith(window.AtlasMembers.avatar(member.name,member.photo));}}
    profile.title=state.active?'Your account · '+state.email:'Sign in to Atlas';
    searchIndex=[
      {title:'Dashboard',href:'index.html',type:'Home',icon:'layout-dashboard'},
      ...rail.map(([href,title,shape])=>({title,href,type:'Page',icon:shape})),
      {title:'Choose a venue tour',href:'venue-tours.html',type:'Venue',icon:'map-pin'},
      {title:'AI Concept Tour',href:'venue/concept/index.html',type:'Venue',icon:'map-pin'},
      {title:'Original Venue Tour',href:'virtual-walkthrough.html',type:'Venue',icon:'map-pin'},
      ...reviews.map(([id,title])=>({title,href:'workspace.html#review/'+id,type:'Delivery review',icon:'chart-no-axes-combined'})),
      ...ops.map(([id,title])=>({title,href:'atlas-reference.html#'+id,type:'Operations section',icon:'panels-top-left'})),
      ...people.map(([id,title])=>({title,href:'atlas-reference.html#people/'+id,type:'People',icon:'users'})),
      ...(planner?.areas()||[]).map(a=>({title:a.title,href:'workspace.html#area/'+encodeURIComponent(a.id),type:'Planning area',icon:'building-2'})),
      ...workstreams.flatMap(w=>[{title:w.title,href:'workspace.html#workstream/'+encodeURIComponent(w.id)+'/list',type:'Planning workstream',icon:'clipboard-list'},...w.lists.map(l=>({title:l.title,href:'workspace.html#list/'+encodeURIComponent(w.id)+'/'+encodeURIComponent(l.id),type:w.title+' · List',icon:'list-todo'}))]),
      ...operations.map(w=>({title:w.title,href:'atlas-reference.html#notebook/'+encodeURIComponent(w.id),type:'Operations workstream',icon:'clipboard-list'})),
      ...(window.AtlasOperationsNavigation?.webAreas()||[]).map(w=>({title:w.title,href:'atlas-reference.html#web/'+encodeURIComponent(w.id),type:'Website content area',icon:'file-text'}))
    ];
    if(pendingFocus){pendingFocus=false;requestAnimationFrame(()=>{const main=document.getElementById('read-main')||document.querySelector('#read-section-guide,.workspace-shell,.planning-surface,.readable-home');if(main){main.tabIndex=-1;main.focus({preventScroll:true});}});}
    if(open&&modal())setOpen(true);
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(refresh);}}
  // The original account button and sign-out action retain all authentication guards.
  const dialog=document.createElement('dialog');dialog.id='atlas-account-settings';dialog.setAttribute('aria-labelledby','account-settings-title');
  dialog.innerHTML='<form method="dialog"><button aria-label="Close account settings">×</button></form><p class="read-eyebrow">YOUR ACCOUNT</p><h2 id="account-settings-title">Account settings</h2><div id="account-current-info"></div><p>Shared edits use this signed-in account. Personal browser drafts remain separate.</p><button type="button" id="account-connect" hidden>Load shared plan</button><button type="button" id="account-appearance">Change light / dark mode</button><button type="button" id="account-logout">Sign out</button>';
  document.body.append(dialog);
  window.AtlasMembers?.mountSettings(dialog);
  let settingsTrigger;
  function showSettings(trigger){const state=accountState();settingsTrigger=trigger;if(open&&modal())setOpen(false);dialog.querySelector('#account-current-info').innerHTML=state.active?`<p><strong>Email</strong><br>${esc(state.email)}</p><p><strong>${window.AtlasTeam?'Planner access':'Account status'}</strong><br>${esc(state.role)}</p>`:'<p>You are signed out. Sign in to open the shared team plan.</p>';dialog.querySelector('#account-logout').hidden=!state.active;dialog.querySelector('#account-connect').hidden=!(state.active&&window.AtlasTeam&&!window.AtlasTeam.active);dialog.showModal();}
  document.addEventListener('click',e=>{if(e.target.closest('#atlas-account-control')&&accountState().active){e.preventDefault();e.stopImmediatePropagation();showSettings(e.target.closest('#atlas-account-control'));}},true);
  footer.querySelector('#atlas-sidebar-settings').onclick=e=>showSettings(e.currentTarget);
  footer.querySelector('#atlas-sidebar-profile').onclick=()=>document.getElementById('atlas-account-control')?.click();
  footer.querySelector('#atlas-sidebar-help').onclick=()=>{if(modal())setOpen(false);document.getElementById('atlas-tutorial')?.shadowRoot?.getElementById('launch')?.click();};
  dialog.querySelector('#account-appearance').onclick=()=>document.getElementById('atlas-theme-toggle')?.click();
  dialog.querySelector('#account-connect').onclick=()=>{dialog.close();document.querySelector('#team-bar [data-team-connect]')?.click();};
  dialog.querySelector('#account-logout').onclick=()=>{dialog.close();if(window.AtlasTeam)document.querySelector('#team-bar [data-team-leave]')?.click();else window.AtlasPageAccount?.signOut();};
  dialog.addEventListener('close',()=>{const destination=settingsTrigger?.getClientRects().length?settingsTrigger:toggle;destination?.focus();});
  let searchIndex=[],searchTrigger;
  const search=document.createElement('dialog');search.className='atlas-search-dialog';search.id='atlas-page-search';search.setAttribute('aria-labelledby','atlas-search-title');
  search.innerHTML=`<header><h2 id="atlas-search-title">Find pages & planning views</h2><form method="dialog"><button aria-label="Close search">${icon('x',18)}</button></form></header><label for="atlas-search-input">Page, workstream or list name</label><input type="search" id="atlas-search-input" autocomplete="off" placeholder="Search by name…"><div class="atlas-search-results" aria-label="Search results"></div><p class="atlas-search-note" role="status"></p>`;
  document.body.append(search);
  function searchResults(){const q=search.querySelector('input').value.trim().toLowerCase(),matches=searchIndex.filter(x=>(x.title+' '+x.type).toLowerCase().includes(q));const shown=matches.slice(0,q?50:12);search.querySelector('.atlas-search-results').innerHTML=shown.length?shown.map(x=>`<a href="${esc(prefix+x.href)}">${icon(x.icon,18)}<span>${esc(x.title)}<small>${esc(x.type)}</small></span>${icon('arrow-up-right',16)}</a>`).join(''):'<p class="ui-empty">No matching page or list. Try another name.</p>';search.querySelector('[role=status]').textContent=q?`${matches.length} matches${matches.length>50?' · Showing the first 50':''}`:'Search the pages and views available here. Use each page’s filters to search its records.';}
  function openSearch(trigger){searchTrigger=trigger;if(open&&modal())setOpen(false);search.querySelector('input').value='';searchResults();search.showModal();search.querySelector('input').focus();}
  searchButton.onclick=e=>openSearch(e.currentTarget);search.querySelector('input').oninput=searchResults;
  search.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();search.close();}});
  search.querySelector('.atlas-search-results').onclick=e=>{if(e.target.closest('a'))search.close();};
  search.addEventListener('close',()=>searchTrigger?.focus());
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&!document.querySelector('dialog[open]')){e.preventDefault();openSearch(searchButton);}});
  window.AtlasSidebar={refresh,schedule,open:()=>setOpen(true,true)};
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-section']});addEventListener('hashchange',schedule);addEventListener('popstate',schedule);
  setOpen(open);refresh();
})();
