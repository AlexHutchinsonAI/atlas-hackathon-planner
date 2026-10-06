/* Read-only visual summaries. Exact values accompany every graphic. */
(() => {
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colors=['#1755d1','#8c49b8','#b55b12','#687a91','#137a70'];
  function distribution(title,rows,note){
    const total=rows.reduce((sum,r)=>sum+Number(r.value||0),0);let offset=0;
    const arcs=rows.map((r,i)=>{const length=total?Number(r.value||0)/total*100:0;const svg=`<circle cx="64" cy="64" r="48" pathLength="100" stroke="${colors[i%colors.length]}" stroke-dasharray="${length} ${100-length}" stroke-dashoffset="${-offset}"/>`;offset+=length;return svg;}).join('');
    return `<section class="visual-distribution" aria-label="${esc(title)}"><div class="visual-disc"><svg viewBox="0 0 128 128" role="img" aria-label="${esc(title+': '+rows.map(r=>r.label+' '+r.value).join(', '))}"><circle class="disc-track" cx="64" cy="64" r="48"/>${arcs}</svg><div><strong>${total.toLocaleString()}</strong><span>Total</span></div></div><div class="visual-legend"><h2>${esc(title)}</h2><ul>${rows.map((r,i)=>`<li><i style="--series:${colors[i%colors.length]}" aria-hidden="true"></i><span>${esc(r.label)}</span><strong>${Number(r.value||0).toLocaleString()}</strong><span>${total?Math.round(Number(r.value||0)/total*100):0}%</span></li>`).join('')}</ul><p>${esc(note)}</p></div></section>`;
  }
  function command(data){
    const walk=lists=>lists.flatMap(l=>[...(l.items||[]),...walk(l.children||[])]);
    const items=data.workstreams.flatMap(w=>walk(w.lists||[]));
    const statuses=['Done','Doing','Waiting','To do'];const rows=statuses.map(label=>({label,value:items.filter(i=>i.status===label).length}));
    const other=items.length-rows.reduce((s,r)=>s+r.value,0);if(other)rows.push({label:'Other recorded status',value:other});
    return `<section class="workspace-observatory"><div class="observatory-heading"><p class="read-eyebrow">CURRENT PLAN / RECORD SNAPSHOT</p><h2>See the work.<br> Choose the next move.</h2><p>Task status is separate from planning readiness. Every item has equal weight in this view.</p></div>${distribution('Task status distribution',rows,'Exact recorded counts · includes all lists and nested lists. Percentages are rounded.')}</section>`;
  }
  window.AtlasVisuals={distribution,command};
})();
