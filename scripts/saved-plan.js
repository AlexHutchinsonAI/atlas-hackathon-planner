/* Preserve Destini's exported plan beside the revised plan, with editable, browser-saved task fields. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function merge(plan) {
    for (const imported of window.ATLAS_DESTINI_PLAN || []) {
      const w = plan.workstreams.find(w => w.id === 'ws' + String(imported.n).padStart(2, '0'));
      if (w && !w.destiniPlan) w.destiniPlan = JSON.parse(JSON.stringify(imported));
    }
    return plan;
  }
  function render(w) {
    const p = w.destiniPlan;
    if (!p) return '';
    return `<details class="brief saved-plan" open><summary>Destini’s saved plan · ${p.tasks.length} tasks · ${p.results.length} key results</summary>
      <p>Imported 2 October 2026. These entries are separate from the revised lists below and are not double-counted in dashboard totals. Edits save on this device; they do not sync to Google Sheets.</p>
      <p><strong>Exported outcome:</strong> ${esc(p.outcome)}</p><p><strong>Leads:</strong> ${esc(p.leads)}</p>
      <div class="saved-table" role="region" aria-label="Destini’s saved tasks" tabindex="0"><table><thead><tr><th>Task</th><th>Owner</th><th>Due date</th><th>Done</th><th>Starts after / review</th></tr></thead><tbody>${p.tasks.map((t,i)=>`<tr><td>${esc(t.title || '[Blank task in export]')}</td><td><input aria-label="Owner for task ${i+1}" data-saved-ws="${esc(w.id)}" data-saved-index="${i}" data-saved-field="owner" value="${esc(t.owner==='—'?'':t.owner)}"></td><td><input aria-label="Due date for task ${i+1}" type="date" data-saved-ws="${esc(w.id)}" data-saved-index="${i}" data-saved-field="date" value="${esc(t.date==='—'?'':t.date)}"></td><td><input aria-label="Complete saved task ${i+1}" type="checkbox" data-saved-ws="${esc(w.id)}" data-saved-index="${i}" data-saved-field="done" ${t.done==='yes'?'checked':''}></td><td>${esc(t.after)}${t.issues.length?`<p class="saved-warning">At import: ${esc(t.issues.join('; ').replace('Dependency cycle: sequence cannot be followed','Dependency chain contains a cycle'))}</p>`:''}</td></tr>`).join('')}</tbody></table></div>
      <details><summary>Key results and evidence · ${p.results.length}</summary><ul>${p.results.map(r=>`<li><strong>${esc(r.title)}</strong><p>Target: ${esc(r.target || 'Not supplied')}${r.target?' (year not stated)':''}<br>Evidence required: ${esc(r.evidence || 'Not supplied')}</p></li>`).join('')}</ul></details>
      <p class="small">Evidence requirements are not proof of completion. Planning dots are not completed tasks. Dependency notes reflect the original export.</p></details>`;
  }
  // Use the existing save pipeline and backup rather than creating an unrelated storage system.
  document.addEventListener('change', event => {
    const input = event.target;
    if (!input.dataset.savedField) return;
    const plan = window.AtlasSave?.snapshot?.()?.data;
    const task = plan?.workstreams.find(w=>w.id===input.dataset.savedWs)?.destiniPlan?.tasks[Number(input.dataset.savedIndex)];
    if (!task || !['owner','date','done'].includes(input.dataset.savedField)) return;
    task[input.dataset.savedField] = input.dataset.savedField==='done'?(input.checked?'yes':'no'):input.value;
    document.dispatchEvent(new Event('atlas-save-now'));
  });
  window.AtlasSavedPlan = {merge,render};
})();
