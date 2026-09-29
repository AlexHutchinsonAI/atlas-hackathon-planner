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
  ) => `<section class="sphere-journey" aria-label="Inside Atlas interactive introduction" data-phase="overview">
    <div class="sphere-stage">
      <div class="sphere-canvas" aria-hidden="true"></div>
      <div class="sphere-fallback" aria-hidden="true"><div class="fallback-orb"><i></i><i></i><i></i><b></b></div></div>
      <div class="sphere-vignette" aria-hidden="true"></div>
      <div class="sphere-overview sphere-layer">
        <div class="sphere-intro"><p class="sphere-eyebrow">INTELLIBUS · AGENTIC AI HACKATHON</p><h1>Inside <span>Atlas.</span></h1><p class="sphere-subtitle">Your people. Your plans. Connected.</p>
          <div class="sphere-actions">
            <a href="atlas-reference.html#people"><span class="sphere-action-icon">${icon("people")}</span><span><strong>People & workforce</strong><small>Profiles, roles and your entire team</small></span><span class="sphere-open">Open ${icon("arrow")}</span></a>
            <button data-action="open-area" data-id="event"><span class="sphere-action-icon">${icon("plans")}</span><span><strong>Competition & judging</strong><small>Rules, reviewers and recognition</small></span><span class="sphere-open">Open ${icon("arrow")}</span></button>
            <a href="atlas-reference.html#transport"><span class="sphere-action-icon">${icon("route")}</span><span><strong>Venue & transport</strong><small>Pickup points, routes and arrival plans</small></span><span class="sphere-open">Open ${icon("arrow")}</span></a>
          </div>
          <div class="sphere-event">23–24 JAN 2027 <span>MONTEGO BAY, JAMAICA</span></div>
        </div>
        <div class="sphere-side-note"><span>A brighter,<br>more connected<br>tomorrow.</span><i></i></div>
        <div class="sphere-stats">${[
          [stats.registrations, "Registration target", "people"],
          [stats.attendance, "Attendance target", "people"],
          [stats.hackers, "Hacker target", "plans"],
          [stats.workstreams, "Workstreams", "route"],
        ]
          .map(
            ([value, label, type]) =>
              `<button data-action="workspace" class="sphere-stat">${icon(type)}<span><b>${Number(value).toLocaleString()}</b><small>${label}</small></span>${icon("arrow")}</button>`,
          )
          .join("")}</div>
        <button class="sphere-scroll-cue" data-sphere-enter><span>Scroll to enter the sphere</span><span aria-hidden="true">↓</span></button>
      </div>
      <div class="sphere-enter sphere-layer" aria-hidden="true" inert><p class="sphere-eyebrow">A DIFFERENT PERSPECTIVE</p><h2>Atlas Agentic AI Hackathon 2027</h2><p>Where individual ideas become connected possibilities.</p></div>
      <div class="sphere-inside sphere-layer" aria-hidden="true" inert><p class="sphere-eyebrow">WELCOME INSIDE</p><h2>Everything is<br><span>connected.</span></h2><p>Follow a connection. Bring your plan to life.</p><div class="neural-portals"><a href="atlas-reference.html#people">${icon("people")}<span>People<small>Meet the collective</small></span>↗</a><button data-action="workspace">${icon("plans")}<span>Plans<small>Explore your workstreams</small></span>↗</button><button data-action="delivery" data-mode="progress">${icon("route")}<span>Progress<small>See what comes next</small></span>↗</button></div><button class="sphere-workspace-button" data-action="workspace">Open your workspace <span>↓</span></button></div>
      <div class="sphere-atoms sphere-layer" aria-hidden="true" inert><p class="sphere-eyebrow">04 · THE ATOMIC LAYER</p><h2>Small ideas.<br><span>Infinite potential.</span></h2><p>Keep scrolling. Every connection brings the plan closer.</p></div>
      <div class="sphere-field sphere-layer" aria-hidden="true" inert><p class="sphere-eyebrow">05 · INTO POSSIBILITY</p><h2>A world of<br><span>possibilities.</span></h2><p>Your people, decisions and next steps are just below.</p><button class="sphere-workspace-button" data-action="workspace">Explore the plan ↓</button></div>
      <div class="sphere-progress" aria-label="Journey stages"><button data-sphere-step="0" aria-label="Show sphere overview" aria-current="step">01 <span>Overview</span></button><i></i><button data-sphere-step="0.28" aria-label="Enter the sphere">02 <span>Enter</span></button><i></i><button data-sphere-step="0.52" aria-label="Explore inside the sphere">03 <span>Connect</span></button><i></i><button data-sphere-step="0.73" aria-label="Explore the atomic layer">04 <span>Atoms</span></button><i></i><button data-sphere-step="0.96" aria-label="Explore the light field">05 <span>Discover</span></button></div>
      <p class="sphere-fallback-note" hidden>The scene is still. Your workspace is ready below.</p>
    </div>
  </section>`;
})();
