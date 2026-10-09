/* Shared presentation and wayfinding. No planner/storage/authentication mutation. */
(() => {
  const embedded = window.self !== window.top;
  const prefix = location.pathname.includes('/venue/') ? '../' : '';
  const sections = {
    direction: ['Operations overview', 'Review operational priorities, owner gaps and readiness. Open a workstream in the Operations register to work on its detail.'],
    outcomes: ['Event outcomes', 'See how workstreams support event results. Planning completeness and task completion measure different things.'],
    notebook: ['Operations register', 'Choose a workstream in the left menu. Review its owner, intended outcome and five planning steps. The five steps measure planning and handover readiness, not tasks completed. These records are separate from the Planning workspace.'],
    people: ['People directory', 'Search by name, role or organisation, then open a profile. Roster prospects are not confirmed attendees.'],
    web: ['Website readiness', 'Review the content and publication status for each website area. Open an area to check its detail and evidence.'],
    transport: ['Transport planning', 'Search and filter pickup locations, then open the full planning detail. Map locations and proposed routes are planning information.'],
    open: ['Follow-up actions', 'Review unresolved actions and questions. Keep the recorded owner, status and next step up to date.'],
    exec: ['Leadership review', 'Review goals and decisions alongside their recorded status. Proposed commitments still need approval.'],
    story: ['Event background', 'Read the event concept and supporting planning context.'],
    baseline: ['Planning baseline', 'Review source assumptions and requirements. Estimates and proposals remain distinct from approved commitments.'],
    mobilize: ['Team mobilisation', 'Review responsibilities, handovers and the people needed to move the plan forward.'],
    refs: ['Source references', 'Open the source documents that support the planning records. Historic sources remain labelled as historic.'],
  };
  let themeButton, scheduled = false;
  function nav() {
    if(window.AtlasSidebar){window.AtlasSidebar.refresh();return;}
    let target = document.querySelector('.mission-nav');
    if (!target && !embedded && /assistant|virtual-walkthrough|\/venue\/index/.test(location.pathname)) {
      target = document.createElement('nav'); target.className = 'mission-nav'; const skipNav=document.querySelector('.read-skip-nav');if(skipNav)skipNav.after(target);else document.body.prepend(target);
    }
    if (!target || target.dataset.readable === 'true') return;
    themeButton ||= document.getElementById('atlas-theme-toggle');
    const account = document.getElementById('atlas-account-control');
    const links = [['index.html','Home'], ['workspace.html','Planning workspace'], ['atlas-reference.html#people','People'], ['atlas-reference.html#notebook','Operations register'], ['atlas-reference.html#transport','Transport'], ['virtual-walkthrough.html','Venue']];
    target.setAttribute('aria-label', 'Main navigation');
    target.innerHTML = `<a class="logo-home" href="${prefix}index.html" aria-label="Atlas home"><img src="${prefix}assets/intellibus-logo.svg" alt="Intellibus" width="140" height="27"></a><span class="product-name">ATLAS <small>2027</small></span><button type="button" class="read-menu-toggle" aria-controls="read-navigation" aria-expanded="false">Menu</button><div class="nav-tools" id="read-navigation">${links.map(([url,label])=>`<a class="nav-link" href="${prefix}${url}">${label}</a>`).join('')}</div>`;
    target.dataset.menuOpen = 'false';
    target.querySelector('.read-menu-toggle').onclick = event => {
      const open=target.dataset.menuOpen !== 'true';target.dataset.menuOpen=String(open);event.currentTarget.setAttribute('aria-expanded',String(open));
    };
    target.dataset.readable = 'true';
    if (account) target.querySelector('.nav-tools').append(account);
    if (themeButton) target.querySelector('.nav-tools').append(themeButton);
  }
  function refresh() {
    scheduled = false;
    if (!embedded) nav();
    themeButton ||= document.getElementById('atlas-theme-toggle');
    const tools = document.querySelector('.mission-nav .nav-tools');
    if (tools && themeButton && themeButton.parentElement !== tools) tools.append(themeButton);
    document.querySelectorAll('.mission-nav a.nav-link').forEach(link => {
      const url = new URL(link.href), same = url.pathname === location.pathname || (url.pathname.endsWith('/index.html') && location.pathname.endsWith('/'));
      const current = same && (!url.hash || url.hash === location.hash || (url.hash === '#notebook' && !['#people','#transport'].includes(location.hash)));
      if(current) { if(link.getAttribute('aria-current')!=='page')link.setAttribute('aria-current','page'); }
      else if(link.hasAttribute('aria-current'))link.removeAttribute('aria-current');
    });
    const views = document.getElementById('views');
    if (views) {
      views.setAttribute('aria-label','Operations sections');
      let toggle=views.querySelector('.read-section-toggle');
      if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='read-section-toggle';toggle.setAttribute('aria-expanded','false');views.prepend(toggle);views.dataset.menuOpen='false';toggle.onclick=()=>{const open=views.dataset.menuOpen!=='true';views.dataset.menuOpen=String(open);toggle.setAttribute('aria-expanded',String(open));};}
      const currentTitle=(sections[document.body.dataset.section]||sections.people)[0];
      if(toggle.textContent!==currentTitle+' · Change section ▾')toggle.textContent=currentTitle+' · Change section ▾';
      views.querySelectorAll('[data-view]').forEach(button=>{
        const key=button.dataset.view;
        const label=({notebook:'Operations register',open:'Follow-up actions',web:'Website readiness'})[key];
        if(label && button.textContent.trim()!==label)button.textContent=label;
        if(button.classList.contains('is-on'))button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
      });
      let guide=document.getElementById('read-section-guide');
      if(!guide){guide=document.createElement('header');guide.id='read-section-guide';guide.className='read-guide';guide.tabIndex=-1;views.after(guide);}
      const key=document.body.dataset.section||'people';let [title,copy]=sections[key]||sections.direction;
      const peopleMode=document.querySelector('[data-pmode][aria-pressed="true"]')?.dataset.pmode||'directory';
      const peopleViews={stakeholders:['Stakeholders','Review engagement groups and available contacts. Recommendations and prospects remain separate from confirmations.'],map:['Communication map','Explore the recorded communication stages and open the people in each stage.'],schools:['Schools & institutions','Explore the institution network, its locations and the supporting school records.']};
      if(key==='people'&&peopleViews[peopleMode])[title,copy]=peopleViews[peopleMode];
      let detail='';try{detail=decodeURIComponent(location.hash.slice(1).split('/')[1]||'');}catch{}
      const contentArea=key==='web'&&window.AtlasOperationsNavigation?.webAreas().find(area=>area.id===detail);
      if(contentArea){title=contentArea.title;copy='Review this content area, its owner, recorded review notes and publication status. Ready status does not publish the website.';}
      const guideKey=key+'|'+(key==='people'?peopleMode:detail)+'|'+title;
      if(guide.dataset.view!==guideKey){guide.dataset.section=key;guide.dataset.view=guideKey;guide.innerHTML=`<div class="section-cover-copy"><p class="read-eyebrow">ATLAS / ${String(Object.keys(sections).indexOf(key)+1).padStart(2,'0')} / WORKING RECORDS</p><h1></h1><p></p></div>`;guide.querySelector('h1').textContent=title;guide.querySelector('.section-cover-copy>p:last-child').textContent=copy;}
      let extra=document.getElementById('read-more-sections');
      if(!extra){
        extra=document.createElement('details');extra.id='read-more-sections';extra.className='read-more-sections';
        extra.innerHTML='<summary>More planning context & sources</summary><nav aria-label="Additional operations sections">'+['exec','story','baseline','mobilize','refs'].map(key=>`<a href="#${key}">${sections[key][0]}</a>`).join('')+'</nav>';
        document.querySelector('.operating-status')?.before(extra);
      }
    }
    const main=document.querySelector('body.atlas-operations .wrap')||document.getElementById('read-main')||document.querySelector('.workspace-shell,.planning-surface,.readable-home,.venue-journey,.assistant-page main,#viewer');
    if(main){if(!main.id)main.id='read-main';main.tabIndex=-1;const skip=document.querySelector('.read-skip');if(skip && skip.hash!=='#'+main.id)skip.href='#'+main.id;}
    const wrap=document.querySelector('body.atlas-operations .wrap');if(wrap && wrap.getAttribute('role')!=='main')wrap.setAttribute('role','main');
    const panel=document.getElementById('panel');if(panel){panel.setAttribute('role','region');panel.setAttribute('aria-label','Selected operations workstream');}
    const register=document.querySelector('#notebookView > nav.register');
    if(register && !register.closest('.notebook-management')){const management=document.createElement('details');management.className='notebook-management';management.open=true;management.innerHTML='<summary>Workstream register · filter or add</summary>';register.before(management);management.append(register);}
    const observatory=document.getElementById('operations-observatory');
    if(observatory&&!observatory.closest('.operations-overview-summary')){const summary=document.createElement('details');summary.className='brief operations-overview-summary';summary.innerHTML='<summary>Planning completeness · all operations workstreams</summary>';observatory.before(summary);summary.append(observatory);}
    const web=document.getElementById('webView');
    for(const [node,label] of [[web?.querySelector(':scope>.visual-distribution'),'Content workflow · all website areas'],[web?.querySelector(':scope>.goalbox'),'Website launch checklist']])if(node){const summary=document.createElement('details');summary.className='brief website-context';summary.innerHTML='<summary></summary>';summary.querySelector('summary').textContent=label;node.before(summary);summary.append(node);}
    const footer=document.querySelector('body.atlas-operations footer.bar');if(footer)footer.setAttribute('role','group');
    document.querySelectorAll('header.atlas-page-intro,.read-guide').forEach(header=>header.setAttribute('role','group'));
    const map=document.getElementById('atlasMap');if(map)map.setAttribute('role','region');
    const intro=document.querySelector('.venue-explorer .intro');if(intro){intro.setAttribute('role','region');intro.setAttribute('aria-label','About the venue explorer');}
    if(!embedded && intro && !intro.dataset.readable){
      const viewer=document.getElementById('viewer');viewer.before(intro);
      intro.after(document.querySelector('.venue-explorer aside'));intro.dataset.readable='true';
    }
    document.querySelectorAll('.person-card h3.person-name,.goalbox h3').forEach(heading=>heading.setAttribute('aria-level','2'));
    document.querySelectorAll('.school-map-side h4').forEach(heading=>heading.setAttribute('aria-level','3'));
    document.querySelectorAll('.oi-grp > h3,#baselineView > .move > .m-head > h3').forEach(heading=>heading.setAttribute('aria-level','2'));
    document.querySelectorAll('#baselineView .sub4').forEach(heading=>heading.setAttribute('aria-level','3'));
    document.querySelectorAll('input:not([type=hidden]),textarea,select').forEach(field=>{
      if(field.hasAttribute('aria-label') || field.closest('label') || (field.id && document.querySelector(`label[for="${CSS.escape(field.id)}"]`)))return;
      const cell=field.closest('td'), row=field.closest('tr');
      const heading=cell?.closest('table')?.tHead?.rows[0]?.cells[cell.cellIndex]?.textContent.trim();
      const record=row?.cells[0]?.textContent.trim().slice(0,90);
      const label=({oiWho:'Filter actions by person',oiSup:'Include supporting actions'})[field.id]||field.placeholder||field.name||field.dataset.field||(heading ? heading+(record?' for '+record:'') : field.type==='checkbox' ? 'Completed: '+(field.closest('.chk')?.textContent.trim().slice(0,90)||'this action') : null);
      if(label)field.setAttribute('aria-label',label);
    });
    document.querySelectorAll('table').forEach((table,index)=>{
      if(table.parentElement.classList.contains('read-table-scroll'))return;
      const wrap=document.createElement('div');wrap.className='read-table-scroll';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',`Planning table ${index+1}. Scroll horizontally to see all columns.`);table.before(wrap);wrap.append(table);
    });
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(refresh);}}
  if(!embedded){
    const skip=document.createElement('a');skip.href='#read-main';skip.className='read-skip';skip.textContent='Skip to page content';
    skip.onclick=e=>{e.preventDefault();const main=document.getElementById('read-main')||document.querySelector('.workspace-shell,.planning-surface,.readable-home,.venue-journey,.assistant-page main,#read-section-guide,#viewer');if(main){main.tabIndex=-1;main.focus();main.scrollIntoView({block:'start'});}};
    const skipNav=document.createElement('nav');skipNav.className='read-skip-nav';skipNav.setAttribute('aria-label','Skip navigation');skipNav.append(skip);document.body.prepend(skipNav);
  }
  if(location.pathname.includes('assistant'))document.body.classList.add('assistant-page');
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-section']});
  addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
  refresh();
})();
