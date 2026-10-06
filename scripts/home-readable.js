/* Native page links in a read-only album carousel. No record or storage writes. */
(() => {
  const albums = [
    ['Planning workspace', 'Tasks, owners and deadlines. Open a workstream to work through its lists.', '#143962', 'workspace.html'],
    ['People directory', 'Find contacts, their roles and recorded roster statuses. Prospects remain separate from confirmed attendees.', '#52488a', 'atlas-reference.html#people/directory'],
    ['Operations register', 'Review the separate operational plans, handovers and five planning checks.', '#286b6b', 'atlas-reference.html#notebook'],
    ['Transport planning', 'Explore pickup locations and transport requirements. Proposed routes still need confirmation.', '#876335', 'atlas-reference.html#transport'],
    ['Venue walkthrough', 'Explore the convention centre through historic 360° photographs and original floor plans.', '#56677c', 'virtual-walkthrough.html'],
    ['Atlas Tech assistant', 'Read setup instructions for the assistant, which is currently in testing.', '#3a447b', 'assistant.html']
  ];
  let mountedStage, dispose, scheduled = false;

  function mountCarousel() {
    const stage = document.querySelector('.album-stage');
    if (stage === mountedStage) return;
    dispose?.();
    mountedStage = stage;
    if (!stage) return;
    const carousel = stage.closest('.album-carousel');
    const covers = [...stage.querySelectorAll('[data-album]')];
    const dots = [...carousel.querySelectorAll('[data-album-select]')];
    const previous = carousel.querySelector('[data-album-step="-1"]');
    const next = carousel.querySelector('[data-album-step="1"]');
    const controller = new AbortController();
    const options = {signal: controller.signal};
    let active = 0, target = null, frame = 0, settleTimer, gesture, suppressClick = false;
    const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    const center = index => covers[index].offsetLeft + covers[index].offsetWidth / 2 - stage.clientWidth / 2;

    function select(index) {
      active = index;
      covers.forEach((cover, i) => cover.dataset.selected = String(i === index));
      dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
      previous.disabled = index === 0;
      next.disabled = index === albums.length - 1;
      const number = String(index + 1).padStart(2, '0');
      carousel.querySelector('#album-position').textContent = `${number} / 06`;
      document.getElementById('album-number').textContent = number;
      document.getElementById('album-name').textContent = albums[index][0];
      document.getElementById('album-description').textContent = albums[index][1];
      const open = document.getElementById('album-open-menu');
      open.href = albums[index][3];
      open.textContent = `Open ${albums[index][0]} →`;
    }

    function paint() {
      frame = 0;
      if (!stage.isConnected) return;
      let closest = 0, distance = Infinity;
      covers.forEach((cover, index) => {
        const delta = center(index) - stage.scrollLeft;
        if (Math.abs(delta) < distance) { closest = index; distance = Math.abs(delta); }
        const relative = delta / (cover.offsetWidth + 24);
        cover.style.setProperty('--album-turn', `${Math.max(-32, Math.min(32, -relative * 20))}deg`);
        cover.style.setProperty('--album-scale', String(1.04 - Math.min(Math.abs(relative), 2) * .07));
      });
      if (closest !== active) select(closest);
    }

    function goTo(index, behavior = motion()) {
      target = Math.max(0, Math.min(albums.length - 1, index));
      stage.scrollTo({left: center(target), behavior});
      if (behavior === 'instant') paint();
    }

    stage.addEventListener('scroll', () => {
      if (!frame) frame = requestAnimationFrame(paint);
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => { target = null; }, 180);
    }, {...options, passive: true});
    carousel.addEventListener('click', event => {
      const step = event.target.closest('[data-album-step]');
      const dot = event.target.closest('[data-album-select]');
      if (step) goTo((target ?? active) + Number(step.dataset.albumStep));
      if (dot) goTo(Number(dot.dataset.albumSelect));
    }, options);
    stage.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const index = target ?? active;
      const destination = {ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: albums.length - 1}[event.key];
      if (destination === undefined) return;
      event.preventDefault();
      goTo(destination);
      if (event.target.closest('[data-album]')) covers[target].focus({preventScroll: true});
    }, options);
    stage.addEventListener('focusin', event => {
      const cover = event.target.closest('[data-album]');
      if (cover && !gesture) goTo(Number(cover.dataset.album));
    }, options);

    // Touch and trackpad scrolling remain native, including vertical page scrolling and pinch zoom.
    // Mouse dragging starts only after movement; an ordinary click keeps normal link behavior.
    stage.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      suppressClick = false;
      gesture = {id: event.pointerId, type: event.pointerType, x: event.clientX, y: event.clientY, scroll: stage.scrollLeft, moved: false, dragging: false};
    }, options);
    document.addEventListener('pointermove', event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 8) gesture.moved = true;
      if (gesture.type !== 'mouse' || !gesture.moved) return;
      if (!gesture.dragging && Math.abs(dx) > Math.abs(dy)) {
        gesture.dragging = true;
        stage.style.scrollSnapType = 'none';
        stage.classList.add('is-dragging');
        stage.setPointerCapture(event.pointerId);
      }
      if (gesture.dragging) {
        event.preventDefault();
        stage.scrollTo({left: gesture.scroll - dx, behavior: 'instant'});
      }
    }, options);
    function finishGesture(event) {
      if (!gesture || gesture.id !== event.pointerId) return;
      const finished = gesture;
      gesture = null;
      suppressClick = finished.moved || event.type === 'pointercancel';
      stage.classList.remove('is-dragging');
      stage.style.scrollSnapType = '';
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      if (finished.dragging) { paint(); goTo(active); covers[active].focus({preventScroll: true}); }
    }
    document.addEventListener('pointerup', finishGesture, options);
    document.addEventListener('pointercancel', finishGesture, options);
    stage.addEventListener('lostpointercapture', finishGesture, options);
    stage.addEventListener('click', event => {
      if (suppressClick && event.detail !== 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressClick = false;
      }
    }, {...options, capture: true});
    stage.addEventListener('dragstart', event => event.preventDefault(), options);
    const resize = new ResizeObserver(() => { if (stage.isConnected && !gesture) goTo(target ?? active, 'instant'); });
    resize.observe(stage);
    select(0);
    paint();
    stage.dataset.ready = 'true';
    dispose = () => { controller.abort(); resize.disconnect(); cancelAnimationFrame(frame); clearTimeout(settleTimer); };
  }

  function scheduleMount() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; mountCarousel(); });
  }
  addEventListener('hashchange', scheduleMount);
  addEventListener('popstate', scheduleMount);

  window.AtlasSphereView = () => {
    scheduleMount();
    return `<section class="readable-home" aria-label="Atlas planner home">
      <header class="album-intro"><div><p class="read-eyebrow">INTELLIBUS / ATLAS / JAMAICA 2027</p><h1>A world<br>of possibilities.</h1><p>One place to plan the hackathon. Find the people, understand the plan and see what needs to happen next.</p></div><aside class="album-date"><strong>Atlas Agentic AI Hackathon 2027</strong><p>23–24 January 2027<br>Montego Bay, Jamaica</p><small>Targets and proposals still need the reviews shown in each section.</small></aside></header>
      <section class="album-carousel" aria-label="Planner albums" aria-roledescription="carousel">
        <div class="album-carousel-toolbar"><p id="album-instructions">Swipe or scroll sideways to browse. Click an album to enter.</p><div class="album-controls"><button type="button" data-album-step="-1" aria-label="Previous album" aria-controls="album-stage" disabled>←</button><span id="album-position">01 / 06</span><button type="button" data-album-step="1" aria-label="Next album" aria-controls="album-stage">→</button></div></div>
        <div class="album-stage" id="album-stage" tabindex="0" role="group" aria-label="Album shelf" aria-describedby="album-instructions">${albums.map(([name,,color,url],i) => `<a class="album-cover" data-album="${i}" data-selected="${i===0}" href="${url}" draggable="false" style="--album-color:${color}"><span>ATLAS / 0${i+1}</span><i class="album-groove" aria-hidden="true"></i><strong>${name}</strong></a>`).join('')}</div>
        <div class="album-dots" role="group" aria-label="Preview an album">${albums.map(([name],i) => `<button type="button" data-album-select="${i}" aria-label="Preview album 0${i+1}: ${name}" aria-pressed="${i===0}" aria-controls="album-stage">0${i+1}</button>`).join('')}</div>
      </section>
      <section class="album-preview" aria-live="polite"><p class="read-eyebrow">SELECTED / <span id="album-number">01</span></p><div><h2 id="album-name">${albums[0][0]}</h2><p id="album-description">${albums[0][1]}</p><a id="album-open-menu" href="${albums[0][3]}">Open ${albums[0][0]} →</a></div></section>
      <aside class="read-home-note"><strong>First time here?</strong><p>Start in the planning workspace for the overall task plan. The operations register holds its separate records. Sign in on either working page to load the shared version; personal browser drafts remain separate. Tutorial gives a guided tour.</p></aside>
    </section>`;
  };
})();
