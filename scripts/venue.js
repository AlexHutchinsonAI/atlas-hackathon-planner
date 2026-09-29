/* Build the scroll route from the complete inventory so no viewpoint is omitted. */
(async () => {
  const inventory = await fetch('venue/scenes.json').then(response => {
    if (!response.ok) throw new Error('Venue inventory unavailable');
    return response.json();
  });
  // Start outdoors, then visit each room group while preserving every source viewpoint.
  const groupOrder = ['seven', 'two', 'five', 'three', 'four', 'one', 'six'];
  const stops = [...inventory].sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group));
  let last = -1;
  let queued = false;
  let activeSection = null;

  function update(force = false) {
    queued = false;
    const section = document.querySelector('#journey-venue');
    if (!section) { activeSection = null; last = -1; return; }
    if (section !== activeSection) {
      activeSection = section;
      last = -1;
      // Give every view the same scroll distance, plus a viewport for the sticky stage.
      section.style.height = `${100 + stops.length * 80}svh`;
    }
    const sticky = section.querySelector('.venue-sticky');
    const top = parseFloat(getComputedStyle(sticky).top) || 0;
    const distance = Math.max(1, section.offsetHeight - sticky.offsetHeight);
    const progress = Math.max(0, Math.min(1, (top - section.getBoundingClientRect().top) / distance));
    const index = Math.min(stops.length - 1, Math.floor(progress * stops.length));
    section.querySelector('.venue-progress span').textContent = `${index + 1} / ${stops.length}`;
    if (!force && index === last) return;
    last = index;
    section.querySelector('iframe').contentWindow?.postMessage({
      type: 'atlas-venue-stop', name: stops[index].name,
    }, location.origin);
  }

  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(() => update()); }
  }, { passive: true });
  addEventListener('resize', () => update(true));
  // Accept scroll and readiness events only from this page's same-origin tour frame.
  addEventListener('message', event => {
    const frame = document.querySelector('.venue-window iframe');
    if (event.origin !== location.origin || event.source !== frame?.contentWindow) return;
    if (event.data?.type === 'atlas-venue-ready') update(true);
    if (event.data?.type === 'atlas-venue-scroll') {
      const delta = Number(event.data.delta);
      if (Number.isFinite(delta)) scrollBy(0, Math.max(-1000, Math.min(1000, delta)));
    }
  });
  document.addEventListener('click', event => {
    if (event.target.closest('.venue-hint button')) event.target.closest('.venue-hint').remove();
  });
  // The planning app can rebuild its contents after an edit; initialize replacement sections too.
  new MutationObserver(() => {
    if (document.querySelector('#journey-venue') !== activeSection) update(true);
  }).observe(document.querySelector('#app'), { childList: true, subtree: true });
  update(true);
})().catch(error => console.error('Venue scroll route:', error));
