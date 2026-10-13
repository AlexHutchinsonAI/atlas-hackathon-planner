/* Continuous native-scroll 3D journey and one final navigation. No planning state, storage or API access. */
(() => {
  const root=document.getElementById('atlas-entrance');
  if(!root)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motion=document.getElementById('landing-motion');
  const stages=[['overview',0,'A world of connections.','Scroll to approach the sphere.'],['approach',.16,'Approach the surface.','The glass sphere draws closer with each scroll.'],['inside',.34,'Inside the sphere.','Travel between the connections. Scroll back to retrace your path.'],['core',.5,'Through the core.','Follow the neural paths deeper into Atlas.'],['arrive',.78,'Your plan is ahead.','Keep scrolling to arrive at the planning dashboard.']];
  document.body.dataset.enhancedJourney='true';
  let armed=false,entering=false,progress=0,navigations=0,timer=null,lastInput=0,guardUntil=0,freshRequired=false,lastScroll=0,forwardIntent=false,touchOrigin=null;
  const now=()=>performance.now();
  function enter(){
    if(entering)return;
    entering=true;armed=false;navigations++;document.body.dataset.entering='true';
    document.querySelector('.landing-status').textContent='Opening dashboard…';
    timer=setTimeout(()=>location.assign('dashboard.html'),reduced.matches?0:130);
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
    const index=stages.findLastIndex(s=>progress>=s[1]),[id,,title,description]=stages[index];
    document.body.dataset.depthStage=id;
    document.body.dataset.depthTone=progress>=.28&&progress<.94?'deep':'light';
    document.getElementById('journey-stage-number').textContent=String(index+1).padStart(2,'0')+' / 05';
    document.getElementById('journey-stage-title').textContent=title;document.getElementById('journey-stage-description').textContent=description;
    root.querySelectorAll('[data-journey-step]').forEach((button,i)=>button.setAttribute('aria-current',i===index?'step':'false'));
    const track=root.querySelector('.journey-track');track.setAttribute('aria-valuenow',String(Math.round(progress*100)));track.setAttribute('aria-valuetext',Math.round(progress*100)+'% · '+title);
    const paused=document.body.classList.contains('motion-paused');
    document.getElementById('journey-scroll-note').textContent=paused?'Motion paused · Enter anytime':progress>=.92?'Continue into dashboard':'Scroll to travel inside';
    if(armed&&progress>=.995&&(forward||forwardIntent)&&!paused)enter();
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
  root.querySelectorAll('[data-journey-step]').forEach(button=>button.addEventListener('click',()=>{
    armed=false;forwardIntent=false;
    const stage=root.querySelector('.sphere-stage'),travel=root.offsetHeight-stage.offsetHeight;
    scrollTo({top:travel*Number(button.dataset.journeyStep),behavior:'instant'});update();
  }));
  function syncMotion(){
    const paused=document.body.classList.contains('motion-paused')||reduced.matches;
    motion.textContent=reduced.matches?'Static view':'Pause journey';
    if(paused&&!reduced.matches)motion.textContent='Resume journey';
    motion.setAttribute('aria-pressed',String(paused));motion.disabled=reduced.matches;
    motion.setAttribute('aria-label',reduced.matches?'Reduced motion static view is active':paused?'Resume sphere journey':'Pause sphere journey');
    document.body.dataset.staticJourney=String(reduced.matches||root.dataset.renderer==='fallback');update();
  }
  motion.addEventListener('click',()=>{document.body.classList.toggle('motion-paused');syncMotion()});
  reduced.addEventListener('change',syncMotion);syncMotion();
  new MutationObserver(syncMotion).observe(root,{attributes:true,attributeFilter:['data-renderer']});
  addEventListener('error',event=>{if(event.target?.tagName==='SCRIPT'&&event.target.src.endsWith('/scripts/sphere.js')){root.dataset.renderer='fallback';}},{capture:true});
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
