/* Atlas MBCC map: all helpers and selectors stay inside this explorer. */
(() => {
'use strict';
const root = document.querySelector('.mbcc-explorer');
const $ = s => root.querySelector(s);
const $$ = s => [...root.querySelectorAll(s)];
const GUIDE='https://mbconventioncentre.com/wp-content/uploads/2021/02/EPG-Revised-Oct-2021.pdf';
const VENUE='https://mbconventioncentre.com/about-us/the-centre/';
const SOURCE='https://virtualtour.mbconventioncentre.com/';
const places=[
{id:'ballroom',n:'01',name:'Grand Ballroom',sub:'D1 · D2 · D3',category:'space',position:[413,357],polygon:'292,345 409,306 505,317 532,363 430,400 325,390',description:'The centre’s grand event space, designed to divide into three sections. Explore the original interior with its high ceiling, detailed lighting and carpeted floor.',facts:[['18,684','sq ft, combined'],['3','ballroom sections']],scenes:['ballroom'],floor:38},
{id:'hall-a',n:'02',name:'Exhibition Hall A',sub:'Exhibition building · A',category:'space',position:[828,399],polygon:'704,388 814,355 917,388 924,425 791,470 727,442',description:'One of the centre’s two exhibition halls. A and B form a flexible exhibition facility with separate loading entrances. Open both original views to compare the spaces.',facts:[['57,525','sq ft, A + B combined'],['2','exhibition halls']],scenes:['hall-a','hall-b'],floor:36},
{id:'hall-b',n:'03',name:'Exhibition Hall B',sub:'Exhibition building · B',category:'space',position:[684,349],polygon:'578,343 661,306 772,320 805,348 703,394 609,376',description:'The second exhibition hall, beside Hall A in the official campus illustration. The venue lists the two halls together as a configurable exhibition facility.',facts:[['57,525','sq ft, A + B combined'],['2','exhibition halls']],scenes:['hall-b','hall-a'],floor:36},
{id:'meetings',n:'04',name:'Meeting Rooms 1–9',sub:'Meeting building · C1–C9',category:'space',position:[287,535],polygon:'135,508 276,476 366,519 401,566 264,615 171,579',description:'Nine meeting rooms in the centre’s dedicated meeting building. Look through six verified original views, including combined rooms C4/C5 and C8/C9. Room C2 has no standalone still panorama included here.',facts:[['10,161','sq ft, combined'],['9','meeting rooms']],scenes:['meeting-c45','meeting-c1','meeting-c3','meeting-c6','meeting-c7','meeting-c89'],floor:37},
{id:'jamaica',n:'05',name:'Jamaica Room',sub:'Jamaica Room · G',category:'space',position:[266,416],polygon:'221,399 278,391 327,422 242,444 190,425',description:'Labeled “Jamaica Room (G)” in the original campus illustration. Step into the interior panorama linked to this exact place in the official tour.',scenes:['jamaica']},
{id:'offices',n:'06',name:'Executive Offices',sub:'Administration building',category:'space',position:[231,376],polygon:'173,365 240,347 296,368 299,391 215,411 175,393',description:'The administration building labeled “Exec Offices” in the official campus illustration, beside the Jamaica Room and Grand Ballroom.',scenes:[],noInterior:'No verified interior panorama is available for the executive offices.'},
{id:'courtyard',n:'07',name:'Open Courtyard',sub:'Official tour: “Open Area Two”',category:'outside',position:[580,474],polygon:'488,456 610,432 682,473 620,512 523,499',description:'The open central area shown in the original tour as “Open Area Two.” Look around the outdoor space and its surrounding buildings from the original viewpoint.',scenes:['courtyard']},
{id:'ballroom-steps',n:'08',name:'Ballroom Steps',sub:'Outdoor connection',category:'outside',position:[504,417],polygon:'429,405 528,382 577,405 596,433 492,464 447,444',description:'An outdoor viewpoint at the ballroom steps, linked directly from the centre’s original virtual tour. Use the panorama to understand the surrounding architecture.',scenes:['ballroom-steps']},
{id:'tower',n:'09',name:'Tower Viewpoint',sub:'Elevated outdoor view',category:'outside',position:[765,464],polygon:'744,429 772,418 783,471 755,486',description:'The original tour’s “View from Tower” looks over the centre and its surroundings. This is a photographic viewpoint; it does not confirm present-day visitor access.',scenes:['tower']},
{id:'parking',n:'10',name:'Parking',sub:'Arrival & access',category:'outside',position:[886,569],polygon:'805,490 923,465 1031,657 941,701 801,572',description:'The parking area is labeled on the right-hand side of the official campus illustration. Parking arrangements and accessible spaces should be confirmed with the venue for your event.',scenes:[],noInterior:'This map identifies the parking area. It does not show live availability, entrances in use or driving routes.',access:true},
{id:'entrance',n:'11',name:'Entrance',sub:'Arrival & access',category:'outside',position:[981,652],polygon:'930,630 1019,654 1037,703 958,705',description:'The approach labeled “Entrance” in the official campus illustration. Use it to orient yourself within the illustrated campus; confirm current arrival instructions with your event organizer.',scenes:[],noInterior:'Entrance placement is illustrative. This is not a turn-by-turn route or confirmation of a specific gate being open.',access:true}
];
const sceneInfo={
'ballroom':{name:'Grand Ballroom',source:'three',yaw:-70},
'hall-a':{name:'Exhibition Hall A',source:'five',yaw:0},
'hall-b':{name:'Exhibition Hall B',source:'five',yaw:0},
'meeting-c1':{name:'Meeting Room C1',short:'C1',source:'six',yaw:28},
'meeting-c3':{name:'Meeting Room C3',short:'C3',source:'six',yaw:170},
'meeting-c45':{name:'Meeting Rooms C4 & C5',short:'C4 + C5',source:'six',yaw:48},
'meeting-c6':{name:'Meeting Room C6',short:'C6',source:'six',yaw:166},
'meeting-c7':{name:'Meeting Room C7',short:'C7',source:'six',yaw:0},
'meeting-c89':{name:'Meeting Rooms C8 & C9',short:'C8 + C9',source:'six',yaw:124},
'jamaica':{name:'Jamaica Room',source:'one',yaw:0},
'courtyard':{name:'Open Courtyard',source:'two',yaw:0},
'ballroom-steps':{name:'Ballroom Steps',source:'four',yaw:0},
 'tower':{name:'Tower Viewpoint',source:'seven',yaw:0}
};
let previousOverflow='',selected=null,filter='all',viewer=null,activeScene=null,viewToken=0;
const svgNS='http://www.w3.org/2000/svg';
for(const p of places){
 const g=document.createElementNS(svgNS,'g');g.classList.add('mbcc-map-shape');if(p.category==='outside')g.classList.add('mbcc-outside');g.dataset.place=p.id;g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',`${p.name}. ${p.scenes.length?'Open details and 360 degree views':'Open details'}`);g.setAttribute('aria-pressed','false');
 g.innerHTML=`<title>${p.name}</title><polygon class="mbcc-building-outline" points="${p.polygon}"/><circle cx="${p.position[0]}" cy="${p.position[1]}" r="26" fill="transparent"/><circle class="mbcc-pin" cx="${p.position[0]}" cy="${p.position[1]}" r="15"/><text x="${p.position[0]}" y="${p.position[1]}">${p.n}</text>`;
 g.addEventListener('click',()=>{if(!suppressClick)selectPlace(p.id)});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPlace(p.id)}});$('#map-shapes').append(g);
}
function matches(p){const q=$('#place-search').value.toLowerCase().trim();return (filter==='all'||p.category===filter)&&`${p.name} ${p.sub} ${p.description}`.toLowerCase().includes(q)}
function renderList(){
 const filtered=places.filter(matches);
 $('#place-list').innerHTML=filtered.map(p=>`<button class="mbcc-place-row ${p.category==='outside'?'mbcc-outside':''}" data-select="${p.id}"><span class="mbcc-place-number">${p.n}</span><span class="mbcc-place-name">${p.name}<span class="mbcc-place-sub">${p.sub}</span></span>${p.scenes.length?'<span class="mbcc-place-360">360°</span>':''}<span class="mbcc-place-arrow" aria-hidden="true">↗</span></button>`).join('');
 $$('#place-list [data-select]').forEach(b=>b.addEventListener('click',()=>selectPlace(b.dataset.select)));
 $('#no-results').hidden=filtered.length>0;
 $$('.mbcc-map-shape').forEach(g=>g.classList.toggle('mbcc-filtered',!filtered.some(p=>p.id===g.dataset.place)));
}
$('#place-search').addEventListener('input',renderList);
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(x=>{x.classList.toggle('mbcc-active',x===b);x.setAttribute('aria-pressed',x===b)});renderList()}));
function selectPlace(id,scroll=true){
 const p=places.find(p=>p.id===id);if(!p)return;selected=p;
 $$('.mbcc-map-shape').forEach(g=>{g.classList.toggle('mbcc-selected',g.dataset.place===id);g.setAttribute('aria-pressed',g.dataset.place===id)});
 $('#selection-status').textContent=`${p.n} / ${p.name}`;
 const preview=p.scenes.length?`<div class="mbcc-details-image"><img src="venue/map/assets/panoramas/${p.scenes[0]}/f.jpg" alt="Archival view of ${sceneInfo[p.scenes[0]].name}"><span class="mbcc-image-tag">ARCHIVAL VENUE PHOTOGRAPH</span></div>`:`<div class="mbcc-details-prompt"><svg viewBox="0 0 60 60" aria-hidden="true"><path d="M14 47V22l16-9 16 9v25M14 27h32M24 27v20m12-20v20M8 47h44"/></svg></div>`;
 $('#details').innerHTML=`<button class="mbcc-details-back" id="back-to-places">← &nbsp; All locations</button>${preview}<div class="mbcc-details-content"><div class="mbcc-details-kicker"><span class="mbcc-place-number">${p.n}</span>${p.category==='space'?'Event space':'Outdoor & access'}</div><h2>${p.name}</h2><p class="mbcc-detail-subtitle">${p.sub}</p><p class="mbcc-details-description">${p.description}</p>${p.facts?`<div class="mbcc-details-facts">${p.facts.map(f=>`<div><strong>${f[0]}</strong><span>${f[1]}</span></div>`).join('')}</div><p class="mbcc-details-facts-source">Official 2021 guide · current configuration unverified</p>`:''}${p.scenes.length?`<button class="mbcc-primary-button" id="open-tour">${p.category==='space'?'Look inside':'Explore the view'} in 360°<span aria-hidden="true">↗</span></button><p class="mbcc-detail-note">${p.scenes.length>1?p.scenes.length+' views to explore. ':''}Original venue imagery; current layout may differ.</p>`:`<div class="mbcc-no-interior">${p.noInterior}</div>`}<div class="mbcc-details-links">${p.floor?`<a href="${GUIDE}#page=${p.floor}" target="_blank" rel="noopener noreferrer">View official floor plan (PDF) ↗</a>`:''}${p.access?'<a href="https://mbconventioncentre.com/about-us/centre-accessibility/" target="_blank" rel="noopener noreferrer">Venue accessibility information ↗</a>':''}<a href="${p.facts?VENUE:SOURCE}" target="_blank" rel="noopener noreferrer">${p.facts?'Official venue details':'Original tour & map'} ↗</a></div></div>`;
 $('#directory').hidden=true;$('#details').hidden=false;$('#sidebar').scrollTop=0;$('#back-to-places').addEventListener('click',showDirectory);if(p.scenes.length)$('#open-tour').addEventListener('click',()=>openTour(p));
 history.replaceState(history.state,'',`#mbcc-${p.id}`);
 if(scroll&&window.innerWidth<=760)$('#sidebar').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
}
function showDirectory(){selected=null;$('#directory').hidden=false;$('#details').hidden=true;$('#selection-status').textContent='11 places to discover';$$('.mbcc-map-shape').forEach(g=>{g.classList.remove('mbcc-selected');g.setAttribute('aria-pressed','false')});history.replaceState(history.state,'',location.pathname+location.search);$('#sidebar').scrollTop=0;$('#place-search').focus({preventScroll:true})}
function openTour(p){
 previousOverflow=document.body.style.overflow;$('#tour-dialog').showModal();document.body.style.overflow='hidden';
 $('#scene-options').innerHTML=p.scenes.map(id=>`<button data-scene="${id}">${sceneInfo[id].short||sceneInfo[id].name}</button>`).join('');
 $$('#scene-options button').forEach(b=>b.addEventListener('click',()=>loadScene(b.dataset.scene)));
 loadScene(p.scenes[0]);
}
function loadScene(id){
 viewToken++;const token=viewToken;activeScene=id;$('#panorama').dataset.loaded='';const info=sceneInfo[id];
 $('#tour-title').textContent=info.name;$('#tour-source-link').href=SOURCE+info.source+'/index.html';$('#fallback-image').href=`venue/map/assets/panoramas/${id}/f.jpg`;$('#fallback-preview').src=$('#fallback-image').href;$('#fallback-preview').alt=`Archival still of ${info.name}`;$('#panorama-fallback').hidden=true;$('#tour-hint').style.opacity='1';
 $$('#scene-options button').forEach(b=>{b.classList.toggle('mbcc-active',b.dataset.scene===id);b.setAttribute('aria-pressed',b.dataset.scene===id)});
 if(viewer){viewer.destroy();viewer=null}
 try{
 viewer=pannellum.viewer('panorama',{type:'cubemap',cubeMap:['f','r','b','l','u','d'].map(face=>`venue/map/assets/panoramas/${id}/${face}.jpg`),autoLoad:true,yaw:info.yaw,pitch:0,hfov:100,minHfov:45,maxHfov:120,showZoomCtrl:true,showFullscreenCtrl:true,mouseZoom:true,showControls:true,escapeHTML:true,friction:.18,orientationOnByDefault:false,strings:{loadingLabel:'Opening the view…'}});
 viewer.on('load',()=>{if(token===viewToken){$('#panorama-fallback').hidden=true;$('#panorama').dataset.loaded=id;$('#panorama canvas')?.addEventListener('webglcontextlost',()=>{if(token!==viewToken)return;$('#panorama').dataset.loaded='';$('#panorama-fallback').hidden=false},{once:true});setTimeout(()=>{if(token===viewToken)$('#tour-hint').style.opacity='0'},5000)}});
 viewer.on('error',()=>{if(token===viewToken)$('#panorama-fallback').hidden=false});
 }catch(e){$('#panorama-fallback').hidden=false}
}
function closeTour(){if(viewer){viewer.destroy();viewer=null}viewToken++;$('#panorama').dataset.loaded='';document.body.style.overflow=previousOverflow;}
$('#tour-close').addEventListener('click',()=>$('#tour-dialog').close());$('#tour-dialog').addEventListener('close',closeTour);
$('#sources-open').addEventListener('click',()=>$('#sources-dialog').showModal());$('#sources-close').addEventListener('click',()=>$('#sources-dialog').close());
for(const id of ['tour-dialog','sources-dialog'])$( '#'+id).addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close()}});
// Map movement is deliberately independent of geographic coordinates.
const viewport=$('#map-viewport'),stage=$('#map-stage');let zoom=1,panX=0,panY=0,fitScale=1,suppressClick=false,dragStart=null,pointers=new Map(),pinchDistance=0,pinchZoom=1;
function updateTransform(){const baseWidth=window.innerWidth<=760?620:Math.max(580,viewport.clientWidth);fitScale=Math.min(1,viewport.clientWidth/baseWidth);const limX=Math.max(30,(baseWidth*fitScale*zoom-viewport.clientWidth)/2+60);const limY=Math.max(30,(baseWidth/2.052*fitScale*zoom-viewport.clientHeight)/2+100);panX=Math.max(-limX,Math.min(limX,panX));panY=Math.max(-limY,Math.min(limY,panY));stage.style.transform=`translate(${panX}px,${panY}px) scale(${fitScale*zoom})`;$('#zoom-in').disabled=zoom>=3;$('#zoom-out').disabled=zoom<=1;}
function setZoom(n){zoom=Math.max(1,Math.min(3,n));updateTransform()}
$('#zoom-in').addEventListener('click',()=>setZoom(zoom+.35));$('#zoom-out').addEventListener('click',()=>setZoom(zoom-.35));$('#reset-map').addEventListener('click',()=>{zoom=1;panX=panY=0;updateTransform()});
viewport.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();setZoom(zoom+(e.deltaY<0?.1:-.1))}},{passive:false});
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.mbcc-map-controls'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});dragStart={x:e.clientX,y:e.clientY,panX,panY};suppressClick=false;if(pointers.size===2){const a=[...pointers.values()];pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);pinchZoom=zoom}});
window.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()];setZoom(pinchZoom*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/pinchDistance);suppressClick=true;return}if(!dragStart)return;const dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;if(Math.hypot(dx,dy)>6){suppressClick=true;viewport.classList.add('mbcc-dragging');panX=dragStart.panX+dx;panY=dragStart.panY+dy;updateTransform()}});
function endPointer(e){pointers.delete(e.pointerId);if(!pointers.size){dragStart=null;viewport.classList.remove('mbcc-dragging');setTimeout(()=>suppressClick=false,0)}}
window.addEventListener('pointerup',endPointer);window.addEventListener('pointercancel',endPointer);
viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;const d=40;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','0'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')panX+=d;if(e.key==='ArrowRight')panX-=d;if(e.key==='ArrowUp')panY+=d;if(e.key==='ArrowDown')panY-=d;if(e.key==='+')setZoom(zoom+.35);if(e.key==='-')setZoom(zoom-.35);if(e.key==='0'){zoom=1;panX=panY=0}updateTransform()}});
window.addEventListener('resize',updateTransform);new ResizeObserver(updateTransform).observe(viewport);renderList();updateTransform();const initial=location.hash.replace(/^#mbcc-/, '');if(places.some(p=>p.id===initial))selectPlace(initial,false);

})();
