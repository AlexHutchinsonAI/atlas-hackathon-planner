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
  ) => `<section id="atlas-universe" class="sphere-journey" data-compact="true" aria-label="Inside Atlas interactive introduction" data-phase="overview">
    <div class="sphere-stage">
      <div class="sphere-canvas" aria-hidden="true"></div>
      <div class="sphere-fallback" aria-hidden="true"><div class="fallback-orb"><i></i><i></i><i></i><b></b></div></div>
      <div class="sphere-vignette" aria-hidden="true"></div>
      <div class="sphere-overview sphere-layer">
        <div class="front-intro">
          <p class="front-eyebrow">INTELLIBUS PRESENTS / JAMAICA 2027</p>
          <h1>Atlas.<br><em>Let’s build.</em></h1>
          <p class="front-event-name">Atlas Agentic AI Hackathon 2027</p>
          <p class="front-description">Your people, plans and venue.<br>Choose where you want to go.</p>
          <!-- Direct shortcut to the five-step progress register shown in the original planner. -->
          <div class="front-actions"><a class="front-primary" href="workspace.html">Open workspace <span>↗</span></a><a href="atlas-reference.html#people">Meet the people →</a><a href="atlas-reference.html#notebook">Workstream progress <span aria-hidden="true">● ● ● ● ● →</span></a><a href="assistant.html">Atlas Tech assistant →</a></div>
        </div>
        <div class="front-orbit-label" aria-hidden="true"><span>ATLAS / 01</span><b>A world of connections.</b></div>
        <div class="front-bottom"><p><b>23–24 January 2027</b><span>Montego Bay, Jamaica</span></p><a href="virtual-walkthrough.html">Virtual walkthrough ↗</a></div>
      </div>
      <p class="sphere-fallback-note" hidden>Your workspace is ready.</p>
    </div>
  </section>`;
})();
