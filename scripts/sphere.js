/* Real-time Atlas sphere. Native scrolling drives the camera; HTML controls remain independent. */
import * as THREE from "../vendor/three/three.module.min.js";

let active = null;
const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const smooth = (a, b, n) => {
  const x = clamp((n - a) / (b - a));
  return x * x * (3 - 2 * x);
};

// A seeded generator makes the city and neural connections stable across re-renders and devices.
function randomSource(seed = 2027) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// Soft point sprites provide small light halos without a costly full-screen bloom pass.
function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.13, "#c5eaff");
  gradient.addColorStop(0.38, "#4c9aff66");
  gradient.addColorStop(1, "#2469e000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

// Build reflective studio lighting locally; no HDR download or third-party rendering service is required.
function reflectionEnvironment(renderer) {
  const room = new THREE.Scene();
  room.background = new THREE.Color("#071a35");
  const shapes = [
    [-5, 3, 2, 1, 9, 2],
    [5, 4, -2, 2, 10, 1],
    [0, 8, 0, 10, 0.4, 7],
    [1, -5, -5, 7, 0.3, 6],
  ];
  shapes.forEach(([x, y, z, w, h, d], i) => {
    const material = new THREE.MeshBasicMaterial({
      color: i % 2 ? "#a4d9ff" : "#ffffff",
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    room.add(mesh);
  });
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(room, 0.08);
  room.traverse((object) => {
    object.geometry?.dispose();
    object.material?.dispose();
  });
  generator.dispose();
  return target;
}

// Mount one scene per home-screen render and release the previous GPU resources before replacing it.
function mount() {
  const root = document.querySelector(".sphere-journey");
  if (active?.root === root) return;
  active?.dispose();
  active = null;
  if (!root) return;
  const stage = root.querySelector(".sphere-stage");
  const holder = root.querySelector(".sphere-canvas");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 700px)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    root.classList.add("sphere-static");
    root.dataset.renderer = "fallback";
    root.querySelector(".sphere-fallback-note").hidden = false;
    active = { root, dispose() {}, state: () => ({ renderer: "fallback" }) };
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
  renderer.setClearColor(0x030d1c, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  holder.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#05132a", 0.014);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.04, 150);
  const environment = reflectionEnvironment(renderer);
  scene.environment = environment.texture;
  const rand = randomSource();
  const halo = glowTexture();
  const center = new THREE.Vector3(3.4, 1.1, 0);
  const sphere = new THREE.Group();
  sphere.position.copy(center);
  scene.add(sphere);
  scene.add(new THREE.AmbientLight("#6f9cd9", 1.2));
  const key = new THREE.DirectionalLight("#d9f3ff", 4);
  key.position.set(2, 8, 8);
  scene.add(key);
  const edgeLight = new THREE.PointLight("#2b7eff", 35, 25, 2);
  edgeLight.position.set(5, 0, 3);
  scene.add(edgeLight);

  // A reflective transparent shell keeps the neural filaments visible; front faces disappear naturally inside.
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#b4dcff",
    metalness: 0.18,
    roughness: 0.055,
    transmission: 0,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    thickness: 0.18,
    ior: 1.16,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.2,
  });
  sphere.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(3.25, mobile ? 48 : 72, mobile ? 32 : 48),
      glass,
    ),
  );
  const rimMaterial = new THREE.ShaderMaterial({
    uniforms: { tint: { value: new THREE.Color("#86ccff") } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader:
      "varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}",
    fragmentShader:
      "varying vec3 n;varying vec3 v;uniform vec3 tint;void main(){float edge=pow(1.0-max(dot(normalize(n),normalize(v)),0.0),4.0);gl_FragColor=vec4(tint,edge*.55);}",
  });
  sphere.add(
    new THREE.Mesh(new THREE.SphereGeometry(3.27, 48, 32), rimMaterial),
  );

  // Sculptural ribbons wrap the glass rather than forming a generic wireframe globe.
  const ribbons = new THREE.Group();
  sphere.add(ribbons);
  const silver = new THREE.MeshStandardMaterial({
    color: "#bcdfff",
    metalness: 0.88,
    roughness: 0.18,
    emissive: "#1755a4",
    emissiveIntensity: 0.22,
  });
  [
    [3.28, 0.023, 0.3, 0.15],
    [3.3, 0.032, 1.1, -0.5],
    [3.31, 0.018, -0.45, 0.65],
  ].forEach(([radius, tube, rx, ry]) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, tube, 8, 160),
      silver,
    );
    ring.rotation.set(rx, ry, 0.15);
    ribbons.add(ring);
  });
  for (let j = 0; j < 3; j++) {
    const points = [];
    for (let i = 0; i <= 130; i++) {
      const t = (i / 130) * Math.PI * 2;
      const y = Math.sin(t * 1.3 + j) * 1.7;
      const radius = Math.sqrt(3.24 ** 2 - y * y);
      points.push(
        new THREE.Vector3(
          Math.cos(t + j) * radius,
          y,
          Math.sin(t + j) * radius,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(points);
    ribbons.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, 180, 0.012, 5, false),
        silver,
      ),
    );
  }

  // Neural paths converge around an inner core, with hundreds of luminous endpoints rendered in batches.
  const positions = [],
    colors = [],
    nodePositions = [];
  const blue = new THREE.Color("#347eff"),
    white = new THREE.Color("#d9f6ff");
  const core = new THREE.Vector3(0, -0.35, -0.5);
  for (let i = 0; i < 85; i++) {
    const y = 1 - (2 * (i + 0.5)) / 85,
      angle = i * Math.PI * (3 - Math.sqrt(5));
    const radius = 2.8 + rand() * 0.2;
    const end = new THREE.Vector3(
      Math.cos(angle) * Math.sqrt(1 - y * y) * radius,
      y * radius,
      Math.sin(angle) * Math.sqrt(1 - y * y) * radius,
    );
    nodePositions.push(end.x, end.y, end.z);
    const start = new THREE.Vector3(
      (rand() - 0.5) * 0.5,
      -2.8 + (i % 3) * 0.1,
      (rand() - 0.5) * 0.6,
    );
    const mid = core
      .clone()
      .add(
        new THREE.Vector3(
          (rand() - 0.5) * 0.8,
          (rand() - 0.5) * 0.4,
          (rand() - 0.5) * 0.8,
        ),
      );
    const branch = mid
      .clone()
      .lerp(end, 0.58)
      .add(new THREE.Vector3((rand() - 0.5) * 0.7, 0.2, (rand() - 0.5) * 0.7));
    const curve = new THREE.CatmullRomCurve3([start, mid, branch, end]);
    const points = curve.getPoints(26);
    points.slice(1).forEach((point, index) => {
      const previous = points[index];
      positions.push(
        previous.x,
        previous.y,
        previous.z,
        point.x,
        point.y,
        point.z,
      );
      const c = blue.clone().lerp(white, 0.2 + rand() * 0.6);
      colors.push(c.r, c.g, c.b, c.r, c.g, c.b);
    });
    if (i % 9 === 0)
      sphere.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(curve, 48, 0.009, 4, false),
          new THREE.MeshBasicMaterial({
            color: "#a8dfff",
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        ),
      );
  }
  const networkGeometry = new THREE.BufferGeometry();
  networkGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  networkGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3),
  );
  sphere.add(
    new THREE.LineSegments(
      networkGeometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  const nodesGeometry = new THREE.BufferGeometry();
  nodesGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(nodePositions, 3),
  );
  sphere.add(
    new THREE.Points(
      nodesGeometry,
      new THREE.PointsMaterial({
        map: halo,
        size: 0.2,
        color: "#a9dbff",
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  const innerCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 32, 24),
    silver,
  );
  innerCore.position.copy(core);
  sphere.add(innerCore);
  const coreHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: halo,
      color: "#6ac8ff",
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  coreHalo.position.copy(core);
  coreHalo.scale.setScalar(1.6);
  sphere.add(coreHalo);

  // Low-rise geometry and light rails form the distant city and reflective arrival platform.
  const city = new THREE.Group();
  scene.add(city);
  const buildingGeometry = new THREE.BoxGeometry(1, 1, 1),
    buildingMaterial = new THREE.MeshStandardMaterial({
      color: "#16375f",
      metalness: 0.8,
      roughness: 0.3,
    });
  const buildings = new THREE.InstancedMesh(
    buildingGeometry,
    buildingMaterial,
    100,
  );
  const dummy = new THREE.Object3D();
  const cityLights = [];
  for (let i = 0; i < 100; i++) {
    const x = (rand() - 0.5) * 65,
      z = -10 - rand() * 30,
      h = 0.3 + Math.pow(rand(), 2) * 3.5,
      w = 0.15 + rand() * 0.7;
    dummy.position.set(x, -2.2 + h / 2, z);
    dummy.scale.set(w, h, w);
    dummy.updateMatrix();
    buildings.setMatrixAt(i, dummy.matrix);
    cityLights.push(x, -2.2 + h, z, x, -2.2 + h - 0.2, z);
  }
  city.add(buildings);
  const lightGeo = new THREE.BufferGeometry();
  lightGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(cityLights, 3),
  );
  city.add(
    new THREE.Points(
      lightGeo,
      new THREE.PointsMaterial({
        map: halo,
        size: 0.23,
        color: "#7bc9ff",
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshStandardMaterial({
      color: "#061429",
      metalness: 0.92,
      roughness: 0.2,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.24;
  scene.add(floor);
  const platform = new THREE.Group();
  platform.position.set(center.x, -2.18, 0);
  scene.add(platform);
  for (const radius of [3.5, 3.8, 4.3, 5.2, 6.8]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.012, 6, 160),
      new THREE.MeshBasicMaterial({
        color: "#8fc5ff",
        transparent: true,
        opacity: radius > 5 ? 0.25 : 0.7,
        blending: THREE.AdditiveBlending,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    platform.add(ring);
  }
  const rails = [];
  for (const x of [-0.5, 0.5, -1, 1])
    rails.push(center.x + x, -2.15, 0, center.x + x * 2, -2.15, 18);
  const railGeo = new THREE.BufferGeometry();
  railGeo.setAttribute("position", new THREE.Float32BufferAttribute(rails, 3));
  scene.add(
    new THREE.LineSegments(
      railGeo,
      new THREE.LineBasicMaterial({
        color: "#65aaf7",
        transparent: true,
        opacity: 0.45,
      }),
    ),
  );

  // A second network extends behind the core so the final camera position feels like a place, not a flat zoom.
  const interior = new THREE.Group();
  interior.position.copy(center);
  scene.add(interior);
  const innerNodes = [],
    innerLines = [];
  for (let i = 0; i < 110; i++) {
    const angle = rand() * Math.PI * 2,
      r = 1.7 + rand() * 5,
      z = -3 - rand() * 22;
    innerNodes.push(Math.cos(angle) * r, Math.sin(angle) * r, z);
    if (i > 0 && i % 3 !== 0) {
      const j = (i - 1) * 3;
      innerLines.push(
        innerNodes[j],
        innerNodes[j + 1],
        innerNodes[j + 2],
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        z,
      );
    }
  }
  const deepGeo = new THREE.BufferGeometry();
  deepGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(innerNodes, 3),
  );
  interior.add(
    new THREE.Points(
      deepGeo,
      new THREE.PointsMaterial({
        map: halo,
        color: "#8acbff",
        size: 0.16,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  const deepLineGeo = new THREE.BufferGeometry();
  deepLineGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(innerLines, 3),
  );
  const deepMaterial = new THREE.LineBasicMaterial({
    color: "#2d86ea",
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
  });
  interior.add(new THREE.LineSegments(deepLineGeo, deepMaterial));

  let progress = 0,
    lastDraw = 0,
    disposed = false,
    visible = true,
    isStatic = false,
    contextLost = false,
    time = 0;
  const startPosition = new THREE.Vector3(),
    startLook = new THREE.Vector3(),
    endPosition = new THREE.Vector3(),
    look = new THREE.Vector3();
  const layers = [...root.querySelectorAll(".sphere-layer")];

  // Inactive phase controls are inert, not merely transparent, so keyboard focus never disappears.
  function setPhase(p) {
    const phase = p < 0.29 ? "overview" : p < 0.68 ? "enter" : "inside";
    root.dataset.phase = phase;
    root.dataset.progress = p.toFixed(3);
    const opacity = [
      1 - smooth(0.12, 0.29, p),
      smooth(0.27, 0.38, p) * (1 - smooth(0.58, 0.68, p)),
      smooth(0.67, 0.8, p),
    ];
    layers.forEach((layer, i) => {
      layer.style.opacity = opacity[i];
      layer.inert = opacity[i] < 0.5;
      layer.setAttribute("aria-hidden", String(opacity[i] < 0.5));
      layer.style.visibility = opacity[i] < 0.01 ? "hidden" : "visible";
    });
    root.querySelectorAll("[data-sphere-step]").forEach((button, i) => {
      const current = i === ["overview", "enter", "inside"].indexOf(phase);
      button.setAttribute("aria-current", current ? "step" : "false");
    });
    root.style.setProperty("--journey-progress", p);
  }

  // Recompute from native scroll position; reverse scrolling retraces the same camera path.
  function updateProgress() {
    const rect = root.getBoundingClientRect(),
      travel = root.offsetHeight - stage.offsetHeight;
    progress = isStatic
      ? 0
      : clamp(
          (parseFloat(getComputedStyle(stage).top) - rect.top) /
            Math.max(travel, 1),
        );
    setPhase(progress);
    if (isStatic) draw(performance.now(), true);
  }
  function resize() {
    const width = stage.clientWidth,
      height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 700 ? 51 : 42;
    camera.updateProjectionMatrix();
    updateProgress();
  }
  function draw(now, force = false) {
    if (disposed || contextLost || document.hidden || (!visible && !force))
      return;
    if (!force && now - lastDraw < (mobile ? 32 : 16)) return;
    const delta = Math.min(0.05, (now - lastDraw) / 1000 || 0);
    lastDraw = now;
    if (!isStatic) time += delta;
    const narrow = stage.clientWidth < 700;
    startPosition.set(narrow ? 1.5 : 0, narrow ? 2.8 : 1.8, narrow ? 15 : 12.8);
    startLook.set(narrow ? 2.8 : 0, narrow ? 1.5 : 1.15, 0);
    endPosition.set(center.x + 0.14, center.y + 0.14, 0.8);
    const travel = smooth(0.04, 0.94, progress);
    camera.position.copy(startPosition).lerp(endPosition, travel);
    look
      .copy(startLook)
      .lerp(
        new THREE.Vector3(center.x, center.y + 0.3, -6),
        smooth(0.08, 0.74, progress),
      );
    camera.lookAt(look);
    ribbons.rotation.y = isStatic ? 0 : Math.sin(time * 0.13) * 0.045;
    coreHalo.material.opacity =
      0.7 + (isStatic ? 0 : Math.sin(time * 1.1) * 0.13);
    city.visible = progress < 0.6;
    platform.visible = progress < 0.7;
    floor.visible = progress < 0.75;
    deepMaterial.opacity = 0.07 + smooth(0.4, 0.8, progress) * 0.25;
    scene.fog.density = 0.023 + progress * 0.007;
    renderer.render(scene, camera);
  }
  function syncMotion() {
    isStatic =
      contextLost ||
      reduced.matches ||
      document.body.classList.contains("motion-paused");
    root.classList.toggle("sphere-static", isStatic);
    resize();
    renderer.setAnimationLoop(
      !isStatic && visible && !document.hidden ? draw : null,
    );
    draw(performance.now(), true);
  }
  function goTo(fraction) {
    if (isStatic) {
      document.getElementById("workspace")?.scrollIntoView({ block: "start" });
      return;
    }
    const top =
      scrollY +
      root.getBoundingClientRect().top -
      parseFloat(getComputedStyle(stage).top);
    window.scrollTo({
      top: top + (root.offsetHeight - stage.offsetHeight) * fraction,
      behavior: reduced.matches ? "instant" : "smooth",
    });
  }
  const onClick = (event) => {
    const step = event.target.closest("[data-sphere-step]");
    if (step) goTo(Number(step.dataset.sphereStep));
    if (event.target.closest("[data-sphere-enter]")) goTo(0.48);
  };
  root.addEventListener("click", onClick);
  window.addEventListener("scroll", updateProgress, { passive: true });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    renderer.setAnimationLoop(
      visible && !isStatic && !document.hidden ? draw : null,
    );
    if (visible) draw(performance.now(), true);
  });
  intersection.observe(stage);
  const classObserver = new MutationObserver(syncMotion);
  classObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
  reduced.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextLost = true;
    isStatic = true;
    setPhase(0);
    root.classList.remove("scene-ready", "sphere-enhanced");
    root.classList.add("sphere-static");
    root.dataset.renderer = "fallback";
    renderer.setAnimationLoop(null);
  });
  root.classList.add("scene-ready", "sphere-enhanced");
  root.dataset.renderer = "webgl";
  resize();
  syncMotion();

  active = {
    root,
    state: () => ({
      renderer: root.dataset.renderer,
      phase: root.dataset.phase,
      progress,
      static: isStatic,
      camera: camera.position.toArray(),
      calls: renderer.info.render.calls,
    }),
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener("scroll", updateProgress);
      root.removeEventListener("click", onClick);
      reduced.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
      resizeObserver.disconnect();
      intersection.disconnect();
      classObserver.disconnect();
      const geometries = new Set(),
        materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material)
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      halo.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
  // Direct workspace URLs bypass the introduction for repeat visits and bookmarks.
  if (location.hash === "#workspace")
    requestAnimationFrame(() =>
      document.getElementById("workspace")?.scrollIntoView({ block: "start" }),
    );
}
window.AtlasSphere = { mount, state: () => active?.state() || null };
mount();
