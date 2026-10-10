import {validateManifest,validateSpecs,validateCad,sceneFromHash,boundedPose} from './manifest.mjs';
import {buildExhibition} from './model.js';
import {buildConceptSpace} from './spaces.js';

// Continuous procedural 3D, rendered only on interaction. No planning document or storage writes.
const $=id=>document.getElementById(id),host=$('concept-view'),cover=$('concept-cover'),select=$('concept-scene');
const controls=[...document.querySelectorAll('[data-look]')],status=$('concept-status');
let manifest,specs,cad,selected,engine,request=0,frame=0,starting=false,overview=false,routeWarning='';
let pose={yaw:0,pitch:0,fov:70},orbit={yaw:-35,pitch:40,distance:52},ready=false,pins=[],lastPoint,pinch;
const pointers=new Map(),originalDialog=$('concept-original-dialog'),detailDialog=$('concept-detail-dialog');
let originalTrigger,detailTrigger;
function state(kind,title,copy,retry=false){
  ready=kind==='ready';host.dataset.state=kind;host.dataset.mode=overview?'overview':'look';host.setAttribute('aria-busy',String(kind==='loading'));host.tabIndex=ready?0:-1;cover.hidden=ready;
  $('concept-state').textContent=kind==='loading'?'Preparing 3D concept':'View unavailable';$('concept-cover-title').textContent=title;$('concept-cover-copy').textContent=copy;
  status.textContent=copy+(routeWarning?' '+routeWarning:'');$('concept-retry').hidden=!retry;$('concept-cover-original').hidden=!selected;
  controls.forEach(button=>button.disabled=!ready);$('concept-overview').disabled=!ready;
  if(!ready){pointers.clear();lastPoint=null;pinch=null;}
}
function disposeEngine(){cancelAnimationFrame(frame);frame=0;if(!engine)return;const previous=engine;engine=null;previous.model.dispose();previous.renderer.dispose();previous.renderer.forceContextLoss();previous.renderer.domElement.remove();$('concept-pins').replaceChildren();pins=[];}
function buildModel(THREE,scene){return scene.model==='exhibition'?buildExhibition(THREE,specs,cad,scene.hall):buildConceptSpace(THREE,specs,scene.model);}
function modelStats(scene){const s=engine.model.statistics;host.dataset.originalTables=String(s.originalTables);host.dataset.originalChairMarks=String(s.originalChairMarks);host.dataset.hall=scene.hall||'';host.dataset.space=scene.model;host.dataset.sofas=String(s.sofas);host.dataset.sofaSa50=String(s.sofaSA50||0);host.dataset.sofaSa21=String(s.sofaSA21||0);}
async function ensureEngine(token,scene){
  if(engine?.broken)disposeEngine();
  const key=scene.model+'-'+(scene.hall||'');
  // Keep one graphics context through the full tour; dispose only the outgoing scene.
  if(engine){if(engine.key!==key){engine.world.remove(engine.model.room);engine.model.dispose();engine.renderer.renderLists.dispose();engine.model=buildModel(engine.THREE,scene);engine.world.add(engine.model.room);engine.key=key;modelStats(scene);}return engine;}
  const THREE=await import('../../vendor/three/three.module.min.js');if(token!==request)return null;
  let renderer,model;
  try{
    renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    renderer.domElement.setAttribute('aria-hidden','true');
    const world=new THREE.Scene();world.background=new THREE.Color(0xe6ecf5);const camera=new THREE.PerspectiveCamera(70,1,.1,180);
    model=buildModel(THREE,scene);world.add(model.room);host.prepend(renderer.domElement);
    engine={THREE,renderer,world,camera,model,key,broken:false};modelStats(scene);
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();if(!engine||event.target!==engine.renderer.domElement)return;engine.broken=true;++request;state('error','The 3D view was interrupted','Try again to reload the model. Original venue photography remains available.',true);});
    return engine;
  }catch(error){model?.dispose();renderer?.dispose();renderer?.forceContextLoss();throw error;}
}
function draw(){
  frame=0;if(!ready||!engine||engine.broken)return;
  const {THREE,renderer,camera,world,model}=engine,width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
  const size=renderer.getSize(new THREE.Vector2());if(size.x!==width||size.y!==height)renderer.setSize(width,height);
  const rad=degrees=>degrees*Math.PI/180;camera.aspect=width/height;model.setOverview(overview);
  if(overview){const p=rad(orbit.pitch),y=rad(orbit.yaw),[cx,cz]=model.center;camera.position.set(cx+Math.sin(y)*Math.cos(p)*orbit.distance,Math.sin(p)*orbit.distance,cz+Math.cos(y)*Math.cos(p)*orbit.distance);camera.lookAt(cx,0,cz);camera.fov=55;}
  else{camera.position.fromArray(selected.position);const p=rad(pose.pitch),y=rad(pose.yaw);camera.lookAt(camera.position.clone().add(new THREE.Vector3(Math.sin(y)*Math.cos(p),Math.sin(p),-Math.cos(y)*Math.cos(p))));camera.fov=pose.fov;}
  camera.updateProjectionMatrix();camera.updateMatrixWorld();renderer.render(world,camera);
  const forward=camera.getWorldDirection(new THREE.Vector3());
  for(const {button,hotspot}of pins){const point=new THREE.Vector3(...hotspot.position),facing=point.clone().sub(camera.position).dot(forward)>0;point.project(camera);const visible=facing&&Math.abs(point.x)<.93&&Math.abs(point.y)<.9;button.hidden=!visible;if(visible){button.style.left=`${(point.x+1)*width/2}px`;button.style.top=`${(1-point.y)*height/2}px`;}}
  host.dataset.mode=overview?'overview':'look';host.dataset.yaw=String(overview?orbit.yaw:pose.yaw);host.dataset.pitch=String(overview?orbit.pitch:pose.pitch);host.dataset.zoom=String(overview?orbit.distance:pose.fov);
}
function redraw(){if(!frame)frame=requestAnimationFrame(draw);}
function overviewPose(scene){const aspect=host.clientWidth/Math.max(1,host.clientHeight);return{yaw:scene.overviewYaw??-35,pitch:40,distance:Math.min(120,(scene.overviewDistance||52)*Math.max(1,1.5/Math.max(.4,aspect)))};}
function move(yaw=0,pitch=0,zoom=0){if(!ready)return;if(overview){orbit.yaw=((orbit.yaw+yaw)%360+540)%360-180;orbit.pitch=Math.max(15,Math.min(80,orbit.pitch+pitch));orbit.distance=Math.max(selected.model==='exhibition'?18:7,Math.min(120,orbit.distance+zoom));}else pose=boundedPose(pose.yaw+yaw,pose.pitch+pitch,pose.fov+zoom);redraw();}
function viewMode(next){overview=next;$('concept-overview').setAttribute('aria-pressed',String(next));$('concept-overview').textContent=next?'Return to eye level':'Room overview';status.textContent=next?'Cutaway overview · Walls and ceiling hidden for layout review. Geometry and placement remain illustrative.':'Eye-level 3D concept · Drag to look around. Geometry and placement remain illustrative.';redraw();}
function showDetail(hotspot,trigger){detailTrigger=trigger;$('concept-detail-title').textContent=hotspot.title;$('concept-detail-copy').textContent=hotspot.description;const go=$('concept-detail-go');go.hidden=!hotspot.sceneId;go.onclick=()=>{detailDialog.close();navigate(hotspot.sceneId);};detailDialog.showModal();}
function details(){
  $('concept-hotspots').replaceChildren();$('concept-pins').replaceChildren();pins=[];
  manifest.hotspots.filter(x=>x.model===selected.model&&(!x.hall||x.hall===selected.hall)).forEach((hotspot,index)=>{const button=document.createElement('button');button.type='button';button.textContent=`${index+1}. ${hotspot.title}`;button.onclick=()=>showDetail(hotspot,button);$('concept-hotspots').append(button);
    const pin=document.createElement('button');pin.type='button';pin.className='concept-pin';pin.textContent=String(index+1);pin.setAttribute('aria-label',`Concept detail ${index+1}: ${hotspot.title}`);pin.hidden=true;pin.onclick=()=>showDetail(hotspot,pin);$('concept-pins').append(pin);pins.push({button:pin,hotspot});});
}
async function loadScene(scene){
  selected=scene;const token=++request;select.value=scene.id;overview=false;orbit=overviewPose(scene);$('concept-overview').setAttribute('aria-pressed','false');$('concept-overview').textContent='Room overview';
  for(const dialog of[detailDialog,originalDialog,imageDialog])if(dialog.open)dialog.close();const index=manifest.scenes.indexOf(scene);$('concept-prev').disabled=index===0;$('concept-next').disabled=index===manifest.scenes.length-1;
  $('concept-title').textContent=scene.title;$('concept-category').textContent=manifest.categories.find(x=>x.id===scene.category).title;$('concept-progress').textContent=scene.model==='exhibition'?`Hall ${scene.hall} · ${scene.hall==='A'?256:192} original table positions`:scene.model==='judges-vip'?'Allocation study · 7 SA-50 + 7 SA-21 sofas':`View ${index+1} of ${manifest.scenes.length}`;
  $('concept-summary').textContent=scene.summary;$('concept-source').textContent=`Architecture reference: ${scene.sourceViewpointId}. ${scene.model==='exhibition'?'Photographic Hall A/B identity remains unverified.':'Event room assignment and dimensions remain conceptual.'}`;
  showStylingPreview(scene.stillId);details();
  $('concept-original').disabled=false;host.setAttribute('aria-label',`${scene.title}. Interactive 3D event concept.`);state('loading','Preparing the 3D room','Building the continuous event concept…');
  try{const view=await ensureEngine(token,scene);if(!view||token!==request)return;pose=boundedPose(scene.view.yaw,scene.view.pitch,scene.view.fov);state('ready','',scene.model==='exhibition'?'Original CAD table positions retained. Heights, physical chairs and additional event equipment remain conceptual.':'3D concept ready. Room assignment, dimensions and fit are illustrative.');details();redraw();}
  catch{if(token===request)state('error','This device could not display the 3D view','Try again, review the still previews below or compare the original photography.',true);}
}
function navigate(id){if(manifest?.scenes.some(x=>x.id===id)&&location.hash!=='#'+id)location.hash=id;}
function route(force=false){if(!manifest)return;const match=sceneFromHash(location.hash,manifest.scenes),scene=match||manifest.scenes.find(x=>x.id===manifest.initialSceneId);routeWarning=!match&&location.hash?'Unknown concept zone; showing the first view.':'';if(!match)history.replaceState(null,'',location.pathname+location.search+'#'+scene.id);if(force||selected?.id!==scene.id)loadScene(scene);}
async function start(){
  if(starting)return;starting=true;state('loading','Preparing the event concept','Loading the model and source references…');
  try{
    const values=await Promise.all(['./manifest.json','./model-specs.json','../scenes.json','./cad-layout.json'].map(async url=>{const response=await fetch(url,{credentials:'same-origin'});if(!response.ok)throw new Error('Concept source unavailable.');return response.json();}));
    manifest=validateManifest(values[0],values[2]);specs=validateSpecs(values[1]);cad=validateCad(values[3]);select.replaceChildren();for(const category of manifest.categories){const group=document.createElement('optgroup');group.label=category.title;for(const scene of manifest.scenes.filter(x=>x.category===category.id))group.append(new Option(scene.title,scene.id));select.append(group);}select.disabled=false;
    $('concept-layout-status').textContent=manifest.layoutStatus+'. Concept stage 50 × 12 ft; main screen 75 × 20 ft. Heights, rigging, clearances and fit remain unverified. Original tour unchanged.';
    prepareGallery();route(true);
  }catch{state('error','The concept sources could not load','Try again or return to the tour choices. The original tour remains available.',true);}finally{starting=false;}
}
const imageDialog=$('concept-image-dialog');let imageTrigger;
function openImage(still,trigger){imageTrigger=trigger;$('concept-image-title').textContent=still.title+' · AI concept still';$('concept-image').src=still.url;$('concept-image').alt=still.title+' — ordinary AI concept image';$('concept-image-caption').textContent=still.description;imageDialog.showModal();}
imageDialog.addEventListener('close',()=>{$('concept-image').removeAttribute('src');if(imageTrigger?.isConnected)imageTrigger.focus();});
function stillFigure(still,compact=false){const figure=document.createElement('figure'),button=document.createElement('button'),image=document.createElement('img'),caption=document.createElement('figcaption');button.type='button';button.className='concept-still-open';button.setAttribute('aria-label','Open '+still.title+' image preview');image.src=still.url;image.alt=still.title+' — AI concept still';image.width=still.width;image.height=still.height;image.loading='lazy';button.append(image);button.onclick=()=>openImage(still,button);caption.textContent=compact?still.title:still.description;figure.append(button,caption);return figure;}
function showStylingPreview(id){const still=manifest.stills.find(x=>x.id===id);const target=$('concept-styling-preview');target.replaceChildren();if(still){const figure=stillFigure(still);target.replaceWith(Object.assign(figure,{id:'concept-styling-preview'}));}}
function prepareGallery(){const gallery=$('concept-gallery');gallery.querySelector('#concept-stills').replaceChildren();gallery.dataset.built='false';gallery.ontoggle=()=>{if(!gallery.open||gallery.dataset.built==='true')return;gallery.dataset.built='true';for(const still of manifest.stills)$('concept-stills').append(stillFigure(still,true));};}
$('concept-retry').onclick=()=>manifest&&specs&&selected?loadScene(selected):start();select.onchange=()=>navigate(select.value);
$('concept-prev').onclick=()=>navigate(manifest.scenes[manifest.scenes.indexOf(selected)-1]?.id);$('concept-next').onclick=()=>navigate(manifest.scenes[manifest.scenes.indexOf(selected)+1]?.id);
$('concept-overview').onclick=()=>viewMode(!overview);
controls.forEach(button=>button.onclick=()=>{const action=button.dataset.look;if(action==='reset'){orbit=overviewPose(selected);pose=boundedPose(selected.view.yaw,selected.view.pitch,selected.view.fov);viewMode(false);}else move(({left:-10,right:10})[action]||0,({up:10,down:-10})[action]||0,({in:-5,out:5})[action]||0);});
host.addEventListener('keydown',event=>{if(!ready||event.target!==host||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(event.key))return;event.preventDefault();if(event.key==='Home'){controls.find(x=>x.dataset.look==='reset').click();return;}move(({ArrowLeft:-10,ArrowRight:10})[event.key]||0,({ArrowUp:10,ArrowDown:-10})[event.key]||0,({'+':-5,'=':-5,'-':5})[event.key]||0);});
host.addEventListener('pointerdown',event=>{if(!ready||event.target.closest('button')||(event.pointerType==='mouse'&&event.button!==0))return;event.preventDefault();host.focus({preventScroll:true});try{host.setPointerCapture(event.pointerId);}catch{}pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});lastPoint=pointers.size===1?{x:event.clientX,y:event.clientY}:null;pinch=null;});
host.addEventListener('pointermove',event=>{if(!ready||!pointers.has(event.pointerId))return;const point={x:event.clientX,y:event.clientY};pointers.set(event.pointerId,point);if(pointers.size===2){const[a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)move(0,0,(pinch-distance)*.1);pinch=distance;lastPoint=null;}else if(pointers.size===1){if(lastPoint)move((lastPoint.x-point.x)*.2,(point.y-lastPoint.y)*.2);lastPoint=point;}});
for(const type of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(type,event=>{pointers.delete(event.pointerId);pinch=null;lastPoint=pointers.size===1?[...pointers.values()][0]:null;});
new ResizeObserver(redraw).observe(host);addEventListener('resize',redraw);addEventListener('hashchange',()=>route());addEventListener('popstate',()=>route());
addEventListener('pagehide',()=>{++request;pointers.clear();disposeEngine();});addEventListener('pageshow',event=>{if(event.persisted&&selected)loadScene(selected);});
detailDialog.addEventListener('close',()=>{if(detailTrigger?.isConnected&&detailTrigger.getClientRects().length)detailTrigger.focus();});
let originalTimer=0;
function originalPhoto(){
  clearTimeout(originalTimer);if(!originalDialog.open||!selected)return;
  const image=document.createElement('img');image.src='../assets/'+selected.sourceViewpointId+'_f.jpg';image.alt=selected.sourceName+' — original front-face photograph';image.width=1536;image.height=1536;
  const note=document.createElement('p');note.className='tour-note';note.textContent='Original front-face photograph. The interactive 360° reference is unavailable on this device.';
  $('concept-original-frame').replaceChildren(image,note);
}
function compareOriginal(trigger){
  if(!selected)return;originalTrigger=trigger;$('concept-original-label').textContent='Architectural source: '+selected.sourceViewpointId+' · Historic photography';originalDialog.showModal();
  if(!engine||engine.broken){originalPhoto();return;}
  const iframe=document.createElement('iframe');iframe.title='Original venue photography reference';iframe.src='../index.html?embedded=1';$('concept-original-frame').replaceChildren(iframe);originalTimer=setTimeout(originalPhoto,10000);
}
for(const id of ['concept-original','concept-cover-original'])$(id).onclick=event=>compareOriginal(event.currentTarget);
addEventListener('message',event=>{const iframe=originalDialog.querySelector('iframe');if(!originalDialog.open||!selected||event.origin!==location.origin||event.source!==iframe?.contentWindow||event.data?.type!=='atlas-venue-ready')return;clearTimeout(originalTimer);iframe.contentWindow.postMessage({type:'atlas-venue-stop',name:selected.sourceName},location.origin);});
originalDialog.addEventListener('close',()=>{clearTimeout(originalTimer);$('concept-original-frame').replaceChildren();if(originalTrigger?.isConnected)originalTrigger.focus();});
start();
