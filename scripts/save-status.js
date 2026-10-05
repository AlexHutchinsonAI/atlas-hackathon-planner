/* Explicit browser persistence with visible success/failure and a portable backup. */
(() => {
  const bar=document.createElement('aside');bar.className='save-dock';bar.setAttribute('aria-label','Save controls');
  bar.innerHTML='<span role="status" id="save-feedback">Edits autosave on this device</span><button type="button" id="save-now">Save now</button><button type="button" id="save-backup">Download backup</button>';
  let activeField;
  function message(text,failed=false){bar.querySelector('[role="status"]').textContent=text;bar.classList.toggle('save-failed',failed);}
  function write(key,value){if(window.AtlasTeam?.readOnly){message("View only · only Alex can edit the shared planner");return false;}try{localStorage.setItem(key,value);message('Saved on this device · '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}));return true;}catch(error){message('Save failed — download a backup before leaving',true);throw error;}}
  function saveNow(){
    // Commit the current field through the app's existing change handler before taking a snapshot.
    if(activeField?.isConnected && activeField.matches('input,textarea,select'))activeField.dispatchEvent(new Event('change',{bubbles:true}));
    document.dispatchEvent(new Event('atlas-save-now'));
  }
  bar.addEventListener('pointerdown',()=>{activeField=document.activeElement;});
  document.addEventListener('focusout',event=>{if(event.target.matches?.('input,textarea,select'))activeField=event.target;});
  bar.querySelector('#save-now').onclick=saveNow;
  bar.querySelector('#save-backup').onclick=()=>{
    saveNow();
    const records={};
    // Export only this planner's keys, never unrelated browser storage or authentication tokens.
    for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if((key.startsWith('intellibus-')||key.startsWith('atlas-')) && !key.startsWith('atlas-cloud-pending-') && (!key.includes('-shared-') || (window.AtlasTeam?.active && key.includes(window.AtlasTeam.draftSuffix))))records[key]=localStorage.getItem(key);}
    const snapshot=window.AtlasSave.snapshot?.();
    const blob=new Blob([JSON.stringify({format:'atlas-backup-v1',exportedAt:new Date().toISOString(),records,current:snapshot},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='atlas-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  window.AtlasSave={write,message};
  document.body.append(bar);
  // Keep save controls beside navigation even when the single-page workspace re-renders.
  new MutationObserver(() => {
    const nav=document.querySelector('.mission-nav');
    if(nav && nav.nextElementSibling !== bar)nav.after(bar);
  }).observe(document.body,{childList:true,subtree:true});
})();
