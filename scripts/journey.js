/* Same-origin operations lives in one document so its records never compete with duplicate editors. */
(() => {
  const embedded = new URLSearchParams(location.search).has("embedded");
  if (embedded && window.parent !== window) {
    document.documentElement.classList.add("journey-embedded");
    const reportHeight = () =>
      parent.postMessage(
        { type: "atlas-journey-height", height: document.body.scrollHeight },
        location.origin,
      );
    new ResizeObserver(reportHeight).observe(document.body);
    reportHeight();
    window.addEventListener("message", (event) => {
      if (
        event.origin === location.origin &&
        event.source === parent &&
        event.data?.type === "atlas-journey-motion"
      )
        document.body.classList.toggle("motion-paused", !!event.data.paused);
    });
  } else {
    // The main motion switch applies to the embedded chapter as well as the sphere.
    const syncMotion = () =>
      document
        .querySelector(".operations-flow")
        ?.contentWindow?.postMessage(
          {
            type: "atlas-journey-motion",
            paused: document.body.classList.contains("motion-paused"),
          },
          location.origin,
        );
    new MutationObserver(syncMotion).observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    document.addEventListener(
      "load",
      (event) => {
        if (event.target.matches?.(".operations-flow")) syncMotion();
      },
      true,
    );
    // Validate both origin and source before accepting a size from the embedded operations document.
    window.addEventListener("message", (event) => {
      const frame = document.querySelector(".operations-flow");
      if (
        event.origin !== location.origin ||
        event.source !== frame?.contentWindow ||
        event.data?.type !== "atlas-journey-height"
      )
        return;
      const height = Number(event.data.height);
      if (Number.isFinite(height) && height > 100 && height < 50000)
        frame.style.height = `${Math.ceil(height)}px`;
    });
  }
})();
