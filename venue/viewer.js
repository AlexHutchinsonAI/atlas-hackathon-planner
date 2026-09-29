import * as THREE from '../vendor/three/three.module.min.js';
// Use the venue's source identifiers rather than inventing undocumented room numbers.
const groups={one:'Jamaica Room',two:'Open area',three:'Grand Ballroom',four:'Ballroom steps & grounds',five:'Exhibition halls',six:'Meeting rooms & adjoining spaces',seven:'Tower & exterior'};
const names={BALLROOM2:'Grand Ballroom',BALLOUT2:'Ballroom exterior',OUTBALLONE:'Ballroom approach',BIGRONE:'Exhibition hall · viewpoint 1',BIGRTWO:'Exhibition hall · viewpoint 2',OUTTOWER2:'View from tower',OUTBIGROOM:'Exterior viewpoint',INDROOM:'Jamaica Room',OUTMIDDLE:'Open area'};
const scenes=await (await fetch('./scenes.json')).json();
const host=document.querySelector('#viewer'),select=document.querySelector('#scene'),status=document.querySelector('#status');
const world=new THREE.Scene(),camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,10);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);host.append(renderer.domElement);
let yaw=0,pitch=0,drag=null,request=0,current=null,index=0;
for(const [group,label] of Object.entries(groups)){const opt=document.createElement('optgroup');opt.label=label;scenes.forEach((s,i)=>{if(s.group===group){const o=new Option(names[s.name]||`${label} · ${s.name}`,String(i));opt.append(o)}});select.append(opt)}
// Load only six faces for the selected stop and discard stale requests to avoid racing selections.
async function change(i){index=(i+scenes.length)%scenes.length;select.value=String(index);const s=scenes[index],token=++request;document.querySelector('#title').textContent=names[s.name]||`${groups[s.group]} · ${s.name}`;status.textContent='Loading panorama…';try{const texture=await new THREE.CubeTextureLoader().loadAsync(['r','l','u','d','f','b'].map(face=>`assets/${s.id}_${face}.jpg`));if(token!==request){texture.dispose();return}texture.colorSpace=THREE.SRGBColorSpace;world.background=texture;current?.dispose();current=texture;yaw=0;pitch=0;draw();status.textContent='360° view ready. Select another stop to continue.'}catch{if(token===request)status.textContent='This viewpoint could not load. Please select another stop.'}}
// Render on interaction, avoiding an unnecessary continuous animation loop.
function draw(){camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;renderer.render(world,camera)}
host.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};host.setPointerCapture(e.pointerId);host.focus()});host.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag.x)*.004;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,-1.45,1.45);drag={x:e.clientX,y:e.clientY};draw()});for(const event of ['pointerup','pointercancel'])host.addEventListener(event,()=>drag=null);
host.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw+=.1;if(e.key==='ArrowRight')yaw-=.1;if(e.key==='ArrowUp')pitch+=.1;if(e.key==='ArrowDown')pitch-=.1;if(['+','='].includes(e.key))camera.fov-=5;if(e.key==='-')camera.fov+=5;pitch=THREE.MathUtils.clamp(pitch,-1.45,1.45);camera.fov=THREE.MathUtils.clamp(camera.fov,35,100);camera.updateProjectionMatrix();draw()});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);draw()});select.addEventListener('change',()=>change(Number(select.value)));document.querySelector('#prev').onclick=()=>change(index-1);document.querySelector('#next').onclick=()=>change(index+1);
// Supplied drawings are displayed as reference images, not as a navigable surveyed map.
['Block D / ballroom','Hall A terrace','Exhibition hall','Plaza square'].forEach((label,i)=>{const a=document.createElement('a');a.href=`research/plan-${i+1}-1.png`;a.target='_blank';a.rel='noopener';a.textContent=`${label} plan ↗`;document.querySelector('#plans').append(a)});
change(scenes.findIndex(s=>s.name==='BALLROOM2'));

// The host page owns scrolling; accept viewpoint changes only from our same-origin parent.
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='atlas-venue-stop')return;const i=scenes.findIndex(s=>s.name===event.data.name);if(i>=0&&i!==index)change(i)});
if(new URLSearchParams(location.search).has('embedded'))document.body.classList.add('embedded');
// Wheel gestures over the panorama continue the host journey; pointer dragging still rotates the view.
if(new URLSearchParams(location.search).has('embedded'))host.addEventListener('wheel',event=>{event.preventDefault();parent.postMessage({type:'atlas-venue-scroll',delta:event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1)},location.origin)},{passive:false});
if(new URLSearchParams(location.search).has('embedded'))parent.postMessage({type:'atlas-venue-ready'},location.origin);
