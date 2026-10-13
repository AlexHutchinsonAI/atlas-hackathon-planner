/* One intentional entrance-to-dashboard navigation. No planning state, storage or API access. */
(() => {
  const root=document.getElementById('atlas-entrance');
  if(!root)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motion=document.getElementById('landing-motion');
  let armed=false,entering=false,progress=0,navigations=0,timer=null,lastInput=0,guardUntil=0,freshRequired=false,lastScroll=0,forwardIntent=false,touchOrigin=null;
  const now=()=>performance.now();
  function enter(){
    if(entering)return;
    entering=true;armed=false;navigations++;document.body.dataset.entering='true';
    document.querySelector('.landing-status').textContent='Opening dashboard…';
    timer=setTimeout(()=>location.assign('index.html'),reduced.matches?0:190);
  }
  function arm(kind){
    const time=now(),gap=time-lastInput;lastInput=time;
    if(entering||time<guardUntil)return;
    if(freshRequired&&kind==='wheel'&&gap<240)return;
    freshRequired=false;armed=true;forwardIntent=kind!=='scrollbar';requestAnimationFrame(update);
  }
  function update(){
    const stage=root.querySelector('.sphere-stage'),travel=Math.max(1,root.offsetHeight-stage.offsetHeight);
    const forward=scrollY>lastScroll+.5;lastScroll=scrollY;
    progress=Math.max(0,Math.min(1,scrollY/travel));
    document.body.style.setProperty('--entrance-progress',progress);
    if(armed&&progress>=.45&&(forward||forwardIntent))enter();
    forwardIntent=false;
  }
  addEventListener('wheel',event=>{
    if(!event.isTrusted||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    if(event.deltaY>0)arm('wheel');else{armed=false;forwardIntent=false;}
  },{passive:true});
  addEventListener('touchstart',event=>{
    touchOrigin=event.isTrusted&&event.touches.length===1&&!event.target.closest('a,button')?event.touches[0].clientY:null;
    if(touchOrigin===null)armed=false;
  },{passive:true});
  addEventListener('touchmove',event=>{
    if(!event.isTrusted||touchOrigin===null||event.touches.length!==1){armed=false;return;}
    const distance=touchOrigin-event.touches[0].clientY;
    if(distance>12)arm('touch');else if(distance< -12){armed=false;forwardIntent=false;}
  },{passive:true});
  addEventListener('touchend',()=>{touchOrigin=null},{passive:true});
  addEventListener('keydown',event=>{
    if(!event.isTrusted||event.repeat||event.target.closest('a,button,input,textarea,select,[contenteditable]'))return;
    if(['ArrowDown','PageDown','End',' '].includes(event.key))arm('key');
  });
  addEventListener('pointerdown',event=>{if(event.isTrusted&&event.pointerType==='mouse'&&event.clientX>=innerWidth-22)arm('scrollbar');},{passive:true});
  addEventListener('scroll',update,{passive:true});
  document.querySelectorAll('[data-dashboard-entry]').forEach(link=>link.addEventListener('click',event=>{
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();enter();
  }));
  function syncMotion(){
    const paused=document.body.classList.contains('motion-paused')||reduced.matches;
    motion.textContent=reduced.matches?'Reduced motion':'Pause motion';
    if(paused&&!reduced.matches)motion.textContent='Resume motion';
    motion.setAttribute('aria-pressed',String(paused));motion.disabled=reduced.matches;
    motion.setAttribute('aria-label',reduced.matches?'Reduced motion is active':paused?'Resume sphere motion':'Pause sphere motion');
  }
  motion.addEventListener('click',()=>{document.body.classList.toggle('motion-paused');syncMotion()});
  reduced.addEventListener('change',syncMotion);syncMotion();
  addEventListener('pagehide',()=>{clearTimeout(timer);window.AtlasSphere?.dispose();});
  addEventListener('pageshow',event=>{
    const returned=event.persisted||['back_forward','reload'].includes(performance.getEntriesByType('navigation')[0]?.type);
    entering=false;armed=false;progress=0;navigations=0;lastScroll=0;forwardIntent=false;touchOrigin=null;clearTimeout(timer);delete document.body.dataset.entering;
    document.querySelector('.landing-status').textContent='';
    freshRequired=returned;guardUntil=returned?now()+700:0;lastInput=now();
    if(returned)requestAnimationFrame(()=>{scrollTo({top:0,behavior:'instant'});update()});
    window.AtlasSphere?.mount();
  });
  window.AtlasEntrance={state:()=>({armed,entering,progress,navigations,freshRequired}),enter};
})();
