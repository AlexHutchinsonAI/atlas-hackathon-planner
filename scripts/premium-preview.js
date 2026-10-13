/* Representative direction preview: presentation only, no writes to records, APIs or storage. */
(() => {
  if(document.body.dataset.atlasLayout!=='premium')return;
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=(name,size=18)=>window.AtlasIcon(name,size);
  const walk=lists=>(lists||[]).flatMap(l=>[...(l.items||[]),...walk(l.children||[])]);
  const original=window.AtlasSphereView;
  window.AtlasSphereView=options=>{
    const template=document.createElement('template');template.innerHTML=original(options);
    const root=template.content.firstElementChild;root.classList.add('premium-dashboard');
    root.querySelector('.dashboard-heading p:last-child').textContent='Choose a workstream. Make the next move.';
    const panel=document.createElement('section');panel.className='premium-work-panel';panel.setAttribute('aria-labelledby','premium-workstreams-title');
    panel.innerHTML=`<header class="premium-panel-head"><div><p class="premium-kicker">THE WORKSPACE</p><h2 id="premium-workstreams-title">Your workstreams</h2></div><span class="premium-total">${options.data.workstreams.length} in this plan</span></header><label class="premium-search">${icon('search')}<input id="premium-workstream-search" type="search" placeholder="Find a workstream…" aria-label="Find a workstream"></label><div class="premium-work-list">${options.data.workstreams.map((w,i)=>{const items=walk(w.lists);return `<a class="premium-work-row" href="workspace.html#workstream/${encodeURIComponent(w.id)}/list" data-premium-workstream data-title="${esc((w.title+' '+(w.originalTitle||'')).toLowerCase())}" ${i>=6?'hidden':''}><span class="premium-row-number">${String(i+1).padStart(2,'0')}</span><span class="premium-row-copy"><strong>${esc(w.title)}</strong><small>${items.length} checklist items · ${w.lists.length} lists</small></span><span class="premium-row-link">Open ${icon('arrow-up-right',16)}</span></a>`}).join('')}</div><p id="premium-search-empty" hidden>No workstreams match this search.</p><footer class="premium-panel-foot"><span id="premium-workstream-results">Showing ${Math.min(6,options.data.workstreams.length)} of ${options.data.workstreams.length}</span><a href="workspace.html">Browse the full workspace ${icon('arrow-right',16)}</a></footer>`;
    const context=root.querySelector('.dashboard-context');context.after(panel);
    const attention=root.querySelector('.dashboard-attention'),grid=root.querySelector('.dashboard-grid'),stats=root.querySelector('.dashboard-stat-grid');
    const attentionDetails=document.createElement('details');attentionDetails.className='premium-disclosure';attentionDetails.innerHTML=`<summary><span>${icon('circle-alert',18)} Needs attention</span><span>${options.attention.length} priority items ${icon('chevron-down',16)}</span></summary>`;attentionDetails.append(attention);panel.after(attentionDetails);
    const planDetails=document.createElement('details');planDetails.className='premium-disclosure premium-plan-details';planDetails.innerHTML=`<summary><span>${icon('chart-no-axes-combined',18)} Plan details</span><span>Counts, readiness & milestones ${icon('chevron-down',16)}</span></summary>`;planDetails.append(stats,grid);attentionDetails.after(planDetails);
    return root.outerHTML;
  };
  document.addEventListener('input',event=>{
    if(event.target.id!=='premium-workstream-search')return;
    const q=event.target.value.trim().toLowerCase(),rows=[...document.querySelectorAll('[data-premium-workstream]')];let visible=0;
    rows.forEach((row,i)=>{const show=q?row.dataset.title.includes(q):i<6;row.hidden=!show;if(show)visible++});
    document.getElementById('premium-workstream-results').textContent=`Showing ${visible} of ${rows.length}`;
    document.getElementById('premium-search-empty').hidden=visible>0;
  });
  const disclosureState=new Map();
  function disclosure(label,key){const d=document.createElement('details');d.className='premium-disclosure';d.open=disclosureState.get(key)||false;d.innerHTML=`<summary><span>${label}</span><span>${icon('chevron-down',16)}</span></summary>`;d.addEventListener('toggle',()=>{if(d.isConnected)disclosureState.set(key,d.open)});return d;}
  function focusWorkspace(){
    const root=document.querySelector('.workspace-shell');if(!root||root.dataset.premiumFocus)return;root.dataset.premiumFocus='true';
    const heading=root.querySelector('.workspace-heading'),views=root.querySelector('.review-shortcuts');
    const status=disclosure('Plan status & review views','workspace-context');heading.after(status);
    const content=document.createElement('div');content.className='premium-disclosure-content';status.append(content);
    for(const node of [views,root.querySelector('[data-persist="status-breakdown"]'),root.querySelector('.dashboard-gauges'),root.querySelector('.dashboard-caption')])if(node)content.append(node);
    const grid=root.querySelector('.flight-grid'),signals=root.querySelector('.signal-stack');
    if(grid&&signals){const d=disclosure('Attention, milestones & related planning','workspace-signals');grid.after(d);d.append(signals);}
    const action=document.createElement('a');action.className='premium-header-action';action.href='workspace.html#review/progress';action.innerHTML=`Review progress ${icon('arrow-up-right',16)}`;heading.append(action);
  }
  let scheduled=false;const refresh=()=>{scheduled=false;focusWorkspace()};
  new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(refresh)}}).observe(document.getElementById('app'),{childList:true,subtree:true});
  requestAnimationFrame(refresh);
})();
