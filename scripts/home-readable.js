/* Destination menu. Presentation only; it never reads or writes records. */
(() => {
  window.AtlasSphereView = () => `<section class="readable-home" aria-label="Atlas planner home">
    <div class="read-home-hero">
      <div><p class="read-eyebrow">Intellibus · Jamaica 2027</p><h1>One place to plan the hackathon.</h1>
      <p>Find the people, understand the plan and see what needs to happen next.</p>
      <a class="read-primary" href="workspace.html">Open planning workspace →</a></div>
      <aside class="read-event-card"><p class="read-eyebrow">Atlas Agentic AI Hackathon 2027</p>
      <h2>23–24 January 2027</h2><p>Montego Bay, Jamaica</p><p>Planning information and working records. Targets and proposals still need the reviews shown in each section.</p></aside>
    </div>
    <h2 class="read-home-section-title">Where would you like to start?</h2>
    <p class="read-home-caption">Each area has a different job. Choose the one you need.</p>
    <div class="read-destinations">
      <a class="read-destination" href="workspace.html"><span class="read-step">01</span><h3>Planning workspace</h3><p>Review tasks, owners and deadlines. Follow progress and open a workstream to edit its lists.</p><span>Open workspace →</span></a>
      <a class="read-destination" href="atlas-reference.html#people"><span class="read-step">02</span><h3>People directory</h3><p>Find contacts, roles and roster statuses. Open a profile for more detail.</p><span>Find people →</span></a>
      <a class="read-destination" href="atlas-reference.html#notebook"><span class="read-step">03</span><h3>Operations register</h3><p>Read the separate operations plans, handovers and readiness checks.</p><span>Review operations →</span></a>
      <a class="read-destination" href="atlas-reference.html#transport"><span class="read-step">04</span><h3>Transport planning</h3><p>Explore pickup locations and the transport plan. Proposed routes still need confirmation.</p><span>Explore transport →</span></a>
      <a class="read-destination" href="virtual-walkthrough.html"><span class="read-step">05</span><h3>Venue walkthrough</h3><p>Look around the convention centre using historic 360° photographs and floor plans.</p><span>Explore the venue →</span></a>
      <a class="read-destination" href="assistant.html"><span class="read-step">06</span><h3>Atlas Tech assistant</h3><p>Get setup instructions for the assistant, which is currently in testing.</p><span>Open assistant guide →</span></a>
    </div>
    <aside class="read-home-note"><strong>First time here?</strong><p>Start in the planning workspace for the overall task plan. Use the operations register for its separate operational records. Sign in on either working page to load the shared version; personal browser drafts remain separate. The Tutorial button gives a guided tour.</p></aside>
    <footer class="read-home-footer"><a href="atlas-reference.html#direction">Operations overview</a><a href="atlas-reference.html#outcomes">Event outcomes</a><a href="atlas-reference.html#web">Website readiness</a><a href="atlas-reference.html#open">Follow-up actions</a></footer>
  </section>`;
})();
