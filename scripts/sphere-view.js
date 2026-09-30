/* Accessible HTML around the decorative 3D scene; every action uses the existing planning app. */
(() => {
  // Small interface icons stay crisp at any screen size without an extra icon library.
  const paths = {
    people:
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
    plans:
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/>',
    route:
      '<rect x="4" y="3" width="16" height="16" rx="3"/><path d="M4 11h16M8 19v3m8-3v3M8 7h8"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.plans}</svg>`;

  // All numbers come from the command plan; target labels prevent them from implying confirmed attendance.
  window.AtlasSphereView = (
    stats,
  ) => `<section id="atlas-universe" class="sphere-journey" aria-label="Inside Atlas interactive introduction" data-phase="overview">
    <div class="sphere-stage">
      <div class="sphere-canvas" aria-hidden="true"></div>
      <div class="sphere-fallback" aria-hidden="true"><div class="fallback-orb"><i></i><i></i><i></i><b></b></div></div>
      <div class="sphere-vignette" aria-hidden="true"></div>
      <div class="sphere-overview sphere-layer">
        <div class="front-intro">
          <p class="front-eyebrow">INTELLIBUS PRESENTS / JAMAICA 2027</p>
          <h1>Big ideas.<br><em>Real-world</em><br>possibilities.</h1>
          <p class="front-event-name">Atlas Agentic AI Hackathon 2027</p>
          <p class="front-description">A meeting of minds. A place to build.<br>Bring the next generation of ideas to life.</p>
          <div class="front-actions"><button data-action="workspace">Open workspace <span>↗</span></button><a href="atlas-reference.html#people">Meet the people →</a></div>
        </div>
        <div class="front-orbit-label" aria-hidden="true"><span>ATLAS / 01</span><b>A world of connections.</b></div>
        <div class="front-bottom"><p><b>23–24 January 2027</b><span>Montego Bay, Jamaica</span></p><button data-sphere-enter>Scroll to explore <span>↓</span></button></div>
      </div>
      <div class="sphere-enter sphere-layer" aria-hidden="true" inert><p class="sphere-eyebrow">A DIFFERENT PERSPECTIVE</p><h2>Atlas Agentic AI Hackathon 2027</h2><p>Where individual ideas become connected possibilities.</p></div>
      <div class="sphere-inside sphere-layer" aria-hidden="true" inert><p class="sphere-eyebrow">WELCOME INSIDE</p><h2>Everything is<br><span>connected.</span></h2><p>Follow a connection. Bring your plan to life.</p><div class="neural-portals"><a href="atlas-reference.html#people">${icon("people")}<span>People<small>Meet the collective</small></span>↗</a><button data-action="workspace">${icon("plans")}<span>Plans<small>Explore your workstreams</small></span>↗</button><button data-action="delivery" data-mode="progress">${icon("route")}<span>Progress<small>See what comes next</small></span>↗</button><a href="virtual-walkthrough.html">${icon("route")}<span>Virtual walkthrough<small>Step inside the venue</small></span>↗</a></div><button class="sphere-workspace-button" data-action="workspace">Open your workspace <span>↓</span></button></div>
      <div class="sphere-atoms sphere-layer" aria-hidden="true" inert><p class="sphere-eyebrow">04 · THE ATOMIC LAYER</p><h2>Small ideas.<br><span>Infinite potential.</span></h2><p>Keep scrolling. Every connection brings the plan closer.</p></div>
      <div class="sphere-field sphere-layer" aria-hidden="true" inert><p class="sphere-eyebrow">05 · INTO POSSIBILITY</p><h2>A world of<br><span>possibilities.</span></h2><p>Your people, decisions and next steps are just below.</p><button class="sphere-workspace-button" data-action="workspace">Explore the plan ↓</button></div>
      <div class="sphere-progress" aria-label="Journey stages"><button data-sphere-step="0" aria-label="Show sphere overview" aria-current="step">01 <span>Overview</span></button><i></i><button data-sphere-step="0.28" aria-label="Enter the sphere">02 <span>Enter</span></button><i></i><button data-sphere-step="0.52" aria-label="Explore inside the sphere">03 <span>Connect</span></button><i></i><button data-sphere-step="0.73" aria-label="Explore the atomic layer">04 <span>Atoms</span></button><i></i><button data-sphere-step="0.96" aria-label="Explore the light field">05 <span>Discover</span></button></div>
      <p class="sphere-fallback-note" hidden>The scene is still. Your workspace is ready below.</p>
    </div>
  </section>
  <section class="front-discover" aria-labelledby="front-discover-title">
    <header><p class="front-eyebrow">FROM POSSIBILITY TO A PLAN</p><h2 id="front-discover-title">One event.<br><em>Everything connected.</em></h2><p>Find your people. Shape the programme. Explore the place where it all comes together.</p></header>
    <div class="front-destinations">
      <a href="atlas-reference.html#people"><span class="front-index">01 / THE COLLECTIVE</span><h3>People make<br>the difference.</h3><p>Meet the judges, coaches, speakers and team behind Atlas.</p><span class="front-destination-link">Explore the directory <b>↗</b></span></a>
      <a href="#workspace"><span class="front-index">02 / THE WORKSPACE</span><h3>A clear view.<br>A shared plan.</h3><p>Follow every workstream, decision and milestone in one place.</p><span class="front-destination-link">Start planning <b>↗</b></span></a>
      <a href="virtual-walkthrough.html"><span class="front-index">03 / THE EXPERIENCE</span><h3>Be there.<br>Before you arrive.</h3><p>Take a 360° journey through Montego Bay Convention Centre.</p><span class="front-destination-link">Enter the venue <b>↗</b></span></a>
    </div>
    <div class="front-numbers" aria-label="Planning targets"><p>THE AMBITION<span>Planning targets, not confirmed attendance</span></p><div><b>${Number(stats.registrations).toLocaleString()}</b><span>Registrations</span></div><div><b>${Number(stats.attendance).toLocaleString()}</b><span>Attendees</span></div><div><b>${Number(stats.hackers).toLocaleString()}</b><span>Hackers</span></div></div>
  </section>`;
})();
