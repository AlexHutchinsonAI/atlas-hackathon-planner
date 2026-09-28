/* Decorative motion for working pages. This module never reads or writes planning records. */
import * as THREE from "../vendor/three/three.module.min.js";
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let active = null,
  refreshFrame = 0;
const paused = () =>
  reduced.matches || document.body.classList.contains("motion-paused");
const pageLabels = {
  notebook: [
    "WORKSTREAMS",
    "Every detail. In motion.",
    "Your workstreams, ownership and execution notes.",
  ],
  web: [
    "WEBSITE READINESS",
    "Ready for the world.",
    "Move content from its owner to the publishing queue.",
  ],
  open: [
    "TEAM ACTIONS",
    "Turn the next step into progress.",
    "Open actions and accountability across the plan.",
  ],
  refs: [
    "SOURCE LIBRARY",
    "The foundations of Atlas.",
    "Source documents and planning references.",
  ],
  baseline: [
    "PLANNING BASELINE",
    "A shared starting point.",
    "The working assumptions behind the event.",
  ],
  mobilize: [
    "MOBILIZATION",
    "Bring the network together.",
    "Outreach, institutions and event participation.",
  ],
};

// Use existing headings wherever possible; add a compact heading only to pages that lack one.
function headingForPage() {
  if (!document.body.classList.contains("atlas-operations"))
    return document.querySelector(
      ".workspace-heading, .planning-surface .compact-heading",
    );
  const section = document.body.dataset.section || "people";
  const targets = {
    people: "#peopleView .directory-heading",
    direction: "#directionView .dash-head",
    outcomes: "#outcomesView .outcome-hero",
    transport: "#transportPageView .transport-map-head",
    exec: "#execView .ex-hero",
    story: "#storyView .st-hero",
  };
  const existing = targets[section] && document.querySelector(targets[section]);
  let intro = document.querySelector(".atlas-page-intro");
  if (existing) {
    if (intro) intro.hidden = true;
    return existing;
  }
  const labels = pageLabels[section];
  if (!labels) {
    if (intro) intro.hidden = true;
    return null;
  }
  if (!intro) {
    intro = document.createElement("header");
    intro.className = "atlas-page-intro";
    document.querySelector("#views").after(intro);
  }
  intro.hidden = false;
  if (intro.dataset.section !== section) {
    intro.dataset.section = section;
    intro.innerHTML = `<span class="people-kicker">${labels[0]}</span><h2>${labels[1]}</h2><p>${labels[2]}</p>`;
  }
  return intro;
}

// Small sculptures share the top sphere's materials without touching its scene or camera.
function mountSculpture(heading) {
  if (active?.heading === heading && active.holder.isConnected) return;
  active?.dispose();
  active = null;
  if (!heading) return;
  heading.classList.add("surface-heading");
  const holder = document.createElement("div");
  holder.className = "surface-orbit";
  holder.setAttribute("aria-hidden", "true");
  heading.append(holder);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    active = {
      heading,
      holder,
      dispose: () => holder.remove(),
      state: () => ({ renderer: "fallback" }),
    };
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  holder.append(renderer.domElement);
  holder.dataset.renderer = "webgl";
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0.25, 5.6);
  scene.add(new THREE.AmbientLight("#a4d7ff", 2.8));
  const key = new THREE.DirectionalLight("#e1f6ff", 4);
  key.position.set(3, 5, 4);
  scene.add(key);
  const fill = new THREE.PointLight("#286cff", 16);
  fill.position.set(-3, 0, 2);
  scene.add(fill);
  const object = new THREE.Group();
  scene.add(object);
  const blue = new THREE.MeshPhysicalMaterial({
    color: "#6eabf0",
    metalness: 0.62,
    roughness: 0.2,
    clearcoat: 1,
    transparent: true,
    opacity: 0.8,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: "#c7eaff",
    metalness: 0.65,
    roughness: 0.22,
  });
  const section = document.body.dataset.section;
  if (section === "people") {
    const geo = new THREE.IcosahedronGeometry(1.13, 1);
    object.add(
      new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        new THREE.LineBasicMaterial({
          color: "#8fcaff",
          transparent: true,
          opacity: 0.5,
        }),
      ),
    );
    const nodes = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: "#e2f6ff", size: 0.065 }),
    );
    object.add(nodes);
  } else {
    // The continuous knot suggests linked workstreams; transport uses an open orbital globe.
    const geometry =
      section === "transport"
        ? new THREE.SphereGeometry(0.7, 32, 24)
        : new THREE.TorusKnotGeometry(0.72, 0.16, 100, 14, 2, 3);
    object.add(new THREE.Mesh(geometry, blue));
  }
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.36 + i * 0.12, 0.017, 8, 100),
      silver,
    );
    ring.rotation.set(0.55 + i * 0.9, 0.4 + i * 0.8, i * 0.45);
    object.add(ring);
  }
  const center = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), silver);
  object.add(center);
  // Satellite crystals add a second moving layer to each working-page sculpture.
  const satellites = new THREE.Group();
  scene.add(satellites);
  for (let i = 0; i < 5; i++) {
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.095, 0),
      silver,
    );
    const angle = (i * Math.PI * 2) / 5;
    crystal.position.set(
      Math.cos(angle) * 1.7,
      Math.sin(angle) * 1.25,
      Math.sin(angle * 2) * 0.6,
    );
    satellites.add(crystal);
  }
  let visible = true,
    disposed = false,
    lost = false,
    time = 0,
    last = 0;
  function draw(now, force = false) {
    if (disposed || lost || document.hidden || (!visible && !force)) return;
    if (!force && now - last < 33) return;
    const delta = Math.min((now - last) / 1000 || 0, 0.05);
    last = now;
    if (!paused()) time += delta;
    object.rotation.y = time * 0.13;
    object.rotation.z = Math.sin(time * 0.3) * 0.12;
    object.rotation.x = paused() ? 0.12 : 0.12 + Math.sin(time * 0.18) * 0.12;
    satellites.rotation.y = -time * 0.22;
    satellites.rotation.z = time * 0.08;
    renderer.render(scene, camera);
  }
  function sync() {
    renderer.setAnimationLoop(
      !paused() && visible && !document.hidden && !lost ? draw : null,
    );
    draw(performance.now(), true);
    holder.dataset.motion = paused() ? "paused" : "playing";
  }
  function resize() {
    const w = holder.clientWidth,
      h = holder.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    draw(performance.now(), true);
  }
  const sizing = new ResizeObserver(resize);
  sizing.observe(holder);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  visibility.observe(holder);
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    lost = true;
    holder.dataset.renderer = "fallback";
    renderer.setAnimationLoop(null);
  });
  resize();
  sync();
  active = {
    heading,
    holder,
    sync,
    state: () => ({
      renderer: holder.dataset.renderer,
      paused: paused(),
      visible,
      calls: renderer.info.render.calls,
    }),
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      sizing.disconnect();
      visibility.disconnect();
      const geometries = new Set(),
        materials = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        if (o.material) materials.add(o.material);
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      blue.dispose();
      silver.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      holder.remove();
    },
  };
}

// CSS sculptures provide distributed depth without creating a WebGL context for every card.
const depthTargets =
  ".atlas-surface .metric-card,.atlas-surface .person-card,.atlas-surface .people-metric,.atlas-surface .command-panel,.atlas-surface .outcome-card,.atlas-surface .chain-card,.atlas-surface .workspace-utilities > details,.atlas-surface .dash-metric";
const depthTracked = new Set();
const depthVisibility = new IntersectionObserver(
  (entries) =>
    entries.forEach(({ target, isIntersecting }) => {
      target.dataset.depthVisible = String(isIntersecting);
    }),
  { threshold: 0.01 },
);
function decorateDepth() {
  depthTracked.forEach((panel) => {
    if (!panel.isConnected) {
      depthVisibility.unobserve(panel);
      depthTracked.delete(panel);
    }
  });
  document.querySelectorAll(depthTargets).forEach((panel, index) => {
    if (
      panel.querySelector(
        ":scope > .depth-mark, :scope > summary > .depth-mark",
      )
    )
      return;
    const mark = document.createElement("span");
    const isOrbit = panel.matches(".command-panel,.person-card,.chain-card");
    mark.className = `depth-mark ${isOrbit ? "depth-orbits" : "depth-prism"}`;
    mark.setAttribute("aria-hidden", "true");
    mark.style.setProperty("--depth-delay", `${index * -0.71}s`);
    mark.innerHTML = isOrbit
      ? '<span class="depth-spin"><i></i><i></i><i></i><b></b></span>'
      : '<span class="depth-spin">' + "<i></i>".repeat(6) + "</span>";
    const mount =
      panel.tagName === "DETAILS"
        ? panel.querySelector(":scope > summary")
        : panel;
    mount.prepend(mark);
    panel.dataset.depthCard = "true";
    depthTracked.add(panel);
    depthVisibility.observe(panel);
  });
}

// Entering panels reveal once. Offscreen panels stay fully readable if enhancement is unavailable.
const revealed = new WeakSet();
const pendingReveals = new Set();
const reveal = new IntersectionObserver(
  (entries) =>
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      if (!paused()) target.classList.add("surface-reveal");
      reveal.unobserve(target);
      pendingReveals.delete(target);
    }),
  { threshold: 0.05 },
);
function refresh() {
  refreshFrame = 0;
  mountSculpture(headingForPage());
  decorateDepth();
  // Release unseen panels removed by filtering or navigation.
  pendingReveals.forEach((panel) => {
    if (!panel.isConnected) {
      reveal.unobserve(panel);
      pendingReveals.delete(panel);
    }
  });
  document
    .querySelectorAll(
      ".atlas-surface .metric-card,.atlas-surface .person-card,.atlas-surface .command-panel,.atlas-surface .outcome-card,.atlas-surface .chain-card,.atlas-surface .workspace-utilities > details",
    )
    .forEach((el) => {
      if (revealed.has(el)) return;
      revealed.add(el);
      pendingReveals.add(el);
      reveal.observe(el);
    });
}
function schedule() {
  if (!refreshFrame) refreshFrame = requestAnimationFrame(refresh);
}
new MutationObserver((records) => {
  if (
    records.some(
      (r) => r.type === "childList" || r.attributeName === "data-section",
    )
  )
    schedule();
  if (records.some((r) => r.attributeName === "class")) active?.sync?.();
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["data-section", "class"],
});
reduced.addEventListener("change", () => active?.sync?.());
document.addEventListener("visibilitychange", () => active?.sync?.());

// Pointer perspective applies only to decorative cards; focusing a form keeps its panel level.
let pointerFrame = 0,
  lit = null;
document.addEventListener(
  "pointermove",
  (event) => {
    if (paused() || event.pointerType !== "mouse") return;
    const card = event.target.closest("[data-depth-card]");
    if (lit !== card) {
      if (lit) {
        lit.style.removeProperty("--tilt-x");
        lit.style.removeProperty("--tilt-y");
      }
      lit = card;
    }
    if (!card || pointerFrame || card.querySelector(":focus-visible")) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!card.isConnected) return;
      const r = card.getBoundingClientRect(),
        x = (event.clientX - r.left) / r.width,
        y = (event.clientY - r.top) / r.height;
      card.style.setProperty("--glass-x", `${x * 100}%`);
      card.style.setProperty("--glass-y", `${y * 100}%`);
      card.style.setProperty(
        "--tilt-x",
        `${(Math.min(1, Math.max(0, y)) - 0.5) * -7}deg`,
      );
      card.style.setProperty(
        "--tilt-y",
        `${(Math.min(1, Math.max(0, x)) - 0.5) * 7}deg`,
      );
    });
  },
  { passive: true },
);
window.AtlasSurfaces = { state: () => active?.state() || null };
refresh();
