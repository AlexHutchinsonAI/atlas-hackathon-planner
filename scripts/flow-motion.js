/* Native scrolling drives a restrained 3D entrance/exit. Editors stay still while in use. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = new Set();
  const visible = new Set();
  let pending = false;
  const embedded = new URLSearchParams(location.search).has('embedded');
  // The parent scrolls embedded operations; its own viewport is not the user's viewport.
  if (embedded) return;
  const selector = '.front-discover > header,.front-destinations > a,.front-numbers,.academy-intro,.academy-paths > h2,.academy-path-grid > a,.workspace-heading,.depth-heading,.planning-surface > header,.directory-heading,.people-hero,.command-panel,.review-summary,.review-table-wrap,.directory-tools,#peopleGrid,.transport-hero,.outcome-hero,.dash-section';
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting}) => isIntersecting ? visible.add(target) : visible.delete(target));
    schedule();
  }, {rootMargin:'120px'});
  function discover() {
    for (const node of targets) if (!node.isConnected) { observer.unobserve(node); targets.delete(node); visible.delete(node); }
    document.querySelectorAll(selector).forEach(node => {
      if (targets.has(node) || node.closest('.sphere-journey,dialog')) return;
      // Avoid multiplying transforms when a panel contains another animated section.
      if (node.parentElement.closest(selector)) return;
      targets.add(node); node.classList.add('river-motion'); observer.observe(node);
    });
    schedule();
  }
  function draw() {
    pending = false;
    const paused = reduced.matches || document.body.classList.contains('motion-paused');
    for (const node of visible) {
      const rect = node.getBoundingClientRect();
      // A broad central reading zone keeps content motionless for reading and editing.
      const enter = Math.max(0,Math.min(1,(rect.top-innerHeight*.76)/(innerHeight*.3)));
      const leave = rect.height < innerHeight*.7 ? Math.max(0,Math.min(1,(-rect.bottom+innerHeight*.1)/(innerHeight*.25))) : 0;
      const amount = paused || node.matches(':focus-within,:hover') ? 0 : enter-leave;
      const scale = 1-Math.abs(amount)*.025;
      // Matrix supplies depth projection; translation, rotation and scale have separate roles.
      node.style.setProperty('--river-transform',`matrix3d(1,0,0,0,0,1,0,0,0,0,1,-0.0008,0,0,0,1) translate3d(0,${amount*42}px,${-Math.abs(amount)*24}px) rotateX(${amount*3}deg) scale3d(${scale},${scale},1)`);
      node.style.setProperty('--river-opacity',String(1-Math.abs(amount)*.18));
    }
  }
  function schedule() { if (!pending) { pending=true; requestAnimationFrame(draw); } }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  document.addEventListener('focusin',schedule);
  document.addEventListener('pointerover',schedule,{passive:true});
  reduced.addEventListener('change',schedule);
  new MutationObserver(discover).observe(document.getElementById('app') || document.body,{childList:true,subtree:true});
  new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
  discover();
})();
