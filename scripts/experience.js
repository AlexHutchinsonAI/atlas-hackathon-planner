/* Shared motion layer. It never changes planning data or intercepts page scrolling. */
(() => {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const motionKey = "atlas-motion-paused";
  let frame = 0;

  // Restore a device-local motion preference; storage restrictions must not prevent rendering.
  function syncMotion() {
    let paused = false;
    try {
      paused = localStorage.getItem(motionKey) === "true";
    } catch {}
    document.body.classList.toggle("motion-paused", paused);
    document.querySelectorAll("[data-motion-toggle]").forEach((button) => {
      button.textContent = paused ? "Play motion" : "Pause motion";
      button.setAttribute("aria-pressed", String(paused));
      button.setAttribute(
        "aria-label",
        paused ? "Play decorative motion" : "Pause decorative motion",
      );
    });
  }

  // Operations pages use the same pause preference as the command dashboard.
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-motion-toggle]")) return;
    const paused = !document.body.classList.contains("motion-paused");
    try {
      localStorage.setItem(motionKey, String(paused));
    } catch {}
    document.body.classList.toggle("motion-paused", paused);
    syncMotion();
  });

  // Observe only panels and cards, including those created by live search or navigation.
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add("is-revealed");
        revealObserver.unobserve(target);
      });
    },
    { threshold: 0.04 },
  );
  function registerReveals(root) {
    if (reducedMotion.matches) return;
    root
      .querySelectorAll(
        ".command-panel:not(.reveal-ready), .person-card:not(.reveal-ready)",
      )
      .forEach((panel) => {
        panel.classList.add("reveal-ready");
        revealObserver.observe(panel);
      });
  }
  const mutations = new MutationObserver((records) => {
    if (records.some((record) => record.addedNodes.length))
      registerReveals(document);
  });
  mutations.observe(document.body, { childList: true, subtree: true });
  registerReveals(document);

  // A single animation frame updates stage lighting; content keeps its natural scroll position.
  document.addEventListener(
    "pointermove",
    (event) => {
      if (
        reducedMotion.matches ||
        document.body.classList.contains("motion-paused") ||
        event.pointerType !== "mouse"
      )
        return;
      const hero = event.target.closest(".command-hero");
      if (!hero || frame) return;
      frame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        hero.style.setProperty(
          "--pointer-x",
          `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
        );
        hero.style.setProperty(
          "--pointer-y",
          `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
        );
        frame = 0;
      });
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("document-hidden", document.hidden);
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches)
      document
        .querySelectorAll(".reveal-ready")
        .forEach((panel) => panel.classList.add("is-revealed"));
  });
  syncMotion();
})();
