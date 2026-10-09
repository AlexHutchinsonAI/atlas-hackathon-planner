/* Original Atlas beacon. Scroll is the only animation clock; planning data is never read or written. */
import * as THREE from '../vendor/three/three.module.min.js';

const clamp = value => Math.max(0, Math.min(1, value));
const ease = (start, end, value) => {const t = clamp((value - start) / (end - start)); return t * t * (3 - 2 * t);};
let active = null;

function makeScene(holder) {
  const renderer = new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5));
  renderer.setClearColor('#06152b');
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  holder.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#06152b', .016);
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
  const ambient = new THREE.HemisphereLight('#c4e5ff', '#112038', 2.8);
  const key = new THREE.DirectionalLight('#c7e5ff', 5);
  key.position.set(-3, 5, 7);
  const edge = new THREE.PointLight('#3288ff', 28, 25, 1.4);
  edge.position.set(4, 1, 2);
  scene.add(ambient, key, edge);

  let seed = 2027;
  const random = () => {seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646;};
  const positions = [];
  for(let i = 0; i < 320; i++) positions.push((random() - .5) * 50, (random() - .5) * 26, -random() * 35 - 3);
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({color:'#8fbfee',size:.055,transparent:true,opacity:.8,sizeAttenuation:true}));
  scene.add(stars);

  // Faceted core and three open bands: original geometry, no downloaded model or texture.
  const beacon = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({color:'#9dc7ee',metalness:.8,roughness:.26});
  const shell = new THREE.Mesh(new THREE.OctahedronGeometry(.9), metal);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.34, 1), new THREE.MeshStandardMaterial({color:'#caeeff',emissive:'#4baeff',emissiveIntensity:2.6,roughness:.25}));
  shell.scale.set(1, 1.35, .65);
  beacon.add(shell, core);
  const bandGeometry = new THREE.TorusGeometry(1.52, .026, 6, 72);
  for(let i = 0; i < 3; i++) {
    const band = new THREE.Mesh(bandGeometry, i === 1 ? new THREE.MeshStandardMaterial({color:'#438aff',emissive:'#164a9c',metalness:.6,roughness:.24}) : metal);
    band.rotation.set(i * 1.08, .4 + i * .7, i * .6);
    beacon.add(band);
  }
  scene.add(beacon);

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 64;
  const glowContext = glowCanvas.getContext('2d');
  const gradient = glowContext.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(115,195,255,1)');
  gradient.addColorStop(.18,'rgba(70,145,255,.8)');
  gradient.addColorStop(1,'rgba(25,75,180,0)');
  glowContext.fillStyle = gradient;
  glowContext.fillRect(0,0,64,64);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false}));
  halo.scale.set(5,5,1);
  beacon.add(halo);

  const flight = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.8,.2,1),new THREE.Vector3(3.2,1,-2),new THREE.Vector3(-1.1,1.8,-4),new THREE.Vector3(1.8,.8,-7),new THREE.Vector3(0,.2,-9)
  ]);
  const trailGeometry = new THREE.BufferGeometry();
  const trailPositions = new Float32Array(48 * 3);
  const trailColors = new Float32Array(48 * 3);
  const blue = new THREE.Color('#7dc6ff');
  for(let i = 0; i < 48; i++) {const fade = 1 - i / 48; trailColors.set([blue.r*fade,blue.g*fade,blue.b*fade],i*3);}
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions,3));
  trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors,3));
  const trail = new THREE.Points(trailGeometry,new THREE.PointsMaterial({map:glowTexture,size:.3,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  trail.frustumCulled = false;
  scene.add(trail);

  const network = new THREE.Group();
  const nodeLocations = [new THREE.Vector3(-4,1,-5),new THREE.Vector3(-2,2.5,-7),new THREE.Vector3(1,2,-6),new THREE.Vector3(4,1.2,-8),new THREE.Vector3(2,-1,-5),new THREE.Vector3(-2,-.8,-4)];
  const nodeMaterial = new THREE.MeshBasicMaterial({color:'#74baff',transparent:true,opacity:0});
  const nodeGeometry = new THREE.IcosahedronGeometry(.10,0);
  for(const location of nodeLocations) {const node = new THREE.Mesh(nodeGeometry,nodeMaterial); node.position.copy(location); network.add(node);}
  const edges = [];
  for(const [a,b] of [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,2],[2,4],[1,5]]) edges.push(...nodeLocations[a].toArray(),...nodeLocations[b].toArray());
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(edges,3));
  const networkMaterial = new THREE.LineBasicMaterial({color:'#4493dd',transparent:true,opacity:0});
  network.add(new THREE.LineSegments(edgeGeometry,networkMaterial));
  scene.add(network);

  // An abstract illuminated horizon, not a claim about the real venue or its geography.
  const landscape = new THREE.PlaneGeometry(34,26,28,18);
  landscape.rotateX(-Math.PI / 2);
  const groundPositions = landscape.attributes.position;
  for(let i=0;i<groundPositions.count;i++) {
    const x=groundPositions.getX(i),z=groundPositions.getZ(i);
    groundPositions.setY(i,Math.sin(x*.47+z*.18)*.55+Math.cos(z*.55)*.4+random()*.45);
  }
  landscape.computeVertexNormals();
  const landscapeMaterial = new THREE.MeshBasicMaterial({color:'#bf975d',wireframe:true,transparent:true,opacity:0});
  const ground = new THREE.Mesh(landscape,landscapeMaterial);
  ground.position.set(0,-2.4,-14);
  scene.add(ground);
  const arrival = new THREE.Mesh(new THREE.TorusGeometry(2.3,.035,6,80),new THREE.MeshBasicMaterial({color:'#f8c282',transparent:true,opacity:0}));
  arrival.position.set(0,.2,-10);
  scene.add(arrival);
  const sunrise = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:'#ffc287',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  sunrise.position.set(0,-.8,-15);sunrise.scale.set(17,8,1);scene.add(sunrise);

  let width=0,height=0,draws=0;
  function draw(progress) {
    const rect=holder.getBoundingClientRect();
    if(!rect.width || !rect.height) return;
    if(rect.width!==width || rect.height!==height) {
      width=rect.width;height=rect.height;
      renderer.setSize(width,height,false);
      camera.aspect=width/height;camera.updateProjectionMatrix();
    }
    const connect=ease(.08,.5,progress),build=ease(.55,1,progress);
    const position=flight.getPoint(progress);
    beacon.position.copy(position);
    beacon.scale.setScalar(1.12 - build*.12);
    beacon.rotation.set(.2+Math.sin(progress*6)*.2,progress*Math.PI*2.3,progress*1.2);
    core.rotation.set(progress*4,progress*8,0);
    halo.material.opacity=.38+connect*.12;
    camera.position.set(Math.sin(progress*Math.PI*2)*2.3,1+build*1.4,10+connect*2);
    camera.lookAt(0,.4,-progress*4.3);
    stars.rotation.y=-progress*.15;
    nodeMaterial.opacity=connect*(1-build*.5);
    networkMaterial.opacity=connect*.4*(1-build*.7);
    network.rotation.y=progress*.2;
    landscapeMaterial.opacity=build*.42;
    arrival.material.opacity=build*.7;
    arrival.rotation.z=progress*.6;
    sunrise.material.opacity=build*.5;
    edge.color.lerpColors(new THREE.Color('#3288ff'),new THREE.Color('#dca768'),build);
    edge.position.copy(position).add(new THREE.Vector3(3,2,2));
    for(let i=0;i<48;i++) {
      const t=clamp(progress-i*.006),point=flight.getPoint(t);
      point.y+=Math.sin(i*.45+progress*12)*.04;
      trailPositions.set(point.toArray(),i*3);
    }
    trailGeometry.attributes.position.needsUpdate=true;
    trailGeometry.setDrawRange(0,Math.min(48,Math.ceil(progress/.006)));
    renderer.render(scene,camera);draws++;
  }
  return {draw,canvas:renderer.domElement,state:()=>({width,height,draws,pixelRatio:renderer.getPixelRatio()}),dispose() {
    const geometries=new Set(),materials=new Set();
    scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)for(const m of Array.isArray(object.material)?object.material:[object.material])materials.add(m);});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());glowTexture.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
  }};
}

function mount() {
  const root=document.querySelector('.home-scroll-journey');
  if(active?.root===root) return;
  active?.dispose();active=null;
  if(!root) return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const stage=root.querySelector('.home-scroll-stage'),holder=root.querySelector('.home-scene-visual');
  const pause=root.querySelector('.home-scene-pause'),cue=root.querySelector('.home-scene-cue');
  let graphics=null,frame=0,progress=0,localPaused=false,disposed=false,failed=false,visible=true;
  const staticPreference=()=>reduced.matches || document.body.classList.contains('motion-paused');
  function schedule() {if(!disposed && !frame && !document.hidden) frame=requestAnimationFrame(update);}
  function position() {
    const span=root.offsetHeight-stage.offsetHeight;
    const top=root.getBoundingClientRect().top;
    return span>0 ? clamp(((parseFloat(getComputedStyle(stage).top)||0)-top)/span) : clamp(-top/stage.offsetHeight);
  }
  function update() {
    frame=0;
    // A preference can change during history restoration or layout updates.
    // Reconcile it before drawing, even if its change event arrives later.
    if(!disposed && root.classList.contains('scene-reduced')!==staticPreference()) {sync();return;}
    if(disposed || document.hidden || !visible) return;
    if(!staticPreference() && !localPaused && !failed) progress=position();
    root.style.setProperty('--scene-progress',String(progress));
    const phase=progress<.33 ? 0 : progress<.72 ? 1 : 2;
    const number=root.querySelector('[data-scene-number]'),label=root.querySelector('[data-scene-phase]');
    if(number.textContent!==['01','02','03'][phase]) number.textContent=['01','02','03'][phase];
    if(label.textContent!==['Discover','Connect','Build'][phase]) label.textContent=['Discover','Connect','Build'][phase];
    if(graphics && !failed && !staticPreference()) graphics.draw(progress);
  }
  function unavailable() {
    failed=true;root.classList.add('scene-fallback');
    if(graphics) graphics.canvas.hidden=true;
    cue.textContent='Explore the sections below.';pause.hidden=true;
  }
  function sync() {
    const still=staticPreference();
    root.classList.toggle('scene-reduced',still);
    if(still) {
      if(graphics) {graphics.canvas.removeEventListener('webglcontextlost',onContextLost);graphics.dispose();graphics=null;}
      pause.hidden=true;cue.textContent='A still view. Choose a section when you’re ready.';
      progress=0;
    } else if(!failed) {
      if(!graphics) {
        try {graphics=makeScene(holder);graphics.canvas.addEventListener('webglcontextlost',onContextLost);}
        catch {unavailable();return;}
      }
      root.classList.add('scene-enhanced');pause.hidden=false;
      cue.textContent=localPaused ? 'Motion paused. All sections remain available.' : 'Scroll to explore. Scroll back to retrace.';
      pause.textContent=localPaused ? 'Resume motion' : 'Pause motion';
      pause.setAttribute('aria-pressed',String(localPaused));
    }
    schedule();
  }
  function onContextLost(event) {if(!disposed) {event.preventDefault();unavailable();}}
  function onPause() {localPaused=!localPaused;sync();}
  pause.addEventListener('click',onPause);
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  document.addEventListener('visibilitychange',schedule);
  document.addEventListener('atlas-navigation-change',schedule);
  reduced.addEventListener('change',sync);
  const resize=new ResizeObserver(schedule);resize.observe(root);resize.observe(stage);resize.observe(holder);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();},{rootMargin:'100px'});intersection.observe(stage);
  const preferences=new MutationObserver(sync);preferences.observe(document.body,{attributes:true,attributeFilter:['class']});
  active={root,state:()=>({progress,phase:progress<.33?'Discover':progress<.72?'Connect':'Build',paused:localPaused || staticPreference(),renderer:failed?'fallback':graphics?'webgl':'static',...graphics?.state()}),dispose() {
    disposed=true;cancelAnimationFrame(frame);pause.removeEventListener('click',onPause);
    removeEventListener('scroll',schedule);removeEventListener('resize',schedule);
    document.removeEventListener('visibilitychange',schedule);document.removeEventListener('atlas-navigation-change',schedule);reduced.removeEventListener('change',sync);
    resize.disconnect();intersection.disconnect();preferences.disconnect();
    if(graphics) {graphics.canvas.removeEventListener('webglcontextlost',onContextLost);graphics.dispose();graphics=null;}
  }};
  sync();
}

// Home can be re-rendered by existing navigation or shared-state refresh. Never touch that renderer.
new MutationObserver(mount).observe(document.getElementById('app'),{childList:true,subtree:true});
addEventListener('pagehide',()=>{active?.dispose();active=null;});
addEventListener('pageshow',mount);
window.AtlasHomeScene={state:()=>active?.state() || null};
mount();
