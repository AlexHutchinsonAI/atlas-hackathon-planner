// A continuous procedural scene. No panorama projection, hosted service or planner writes.
// Architecture follows visible source features; dimensions and placements are illustrative.
import {addCadLayout} from './cad-model.js';
export function buildExhibition(THREE, specs, cad, hall='B') {
  const root=new THREE.Group(),room = new THREE.Group(), shell = new THREE.Group(), ceiling = new THREE.Group(),stageGroup=new THREE.Group();
  const center=[27,hall==='B'?76.5:22.5];room.position.set(center[0],0,center[1]);room.rotation.y=Math.PI;root.add(room);
  let activeParent=room;
  const geometry = new Map(), materials = new Map(), ownedTextures = [];
  const c = {cream:0xeee4cd, trim:0xdfd4bb, floor:0xc7beaa, blue:0x2049bc, white:0xf9fafc, black:0x202632, steel:0x48515c, glazing:0x479fc1, chair:0x8d979f};
  const spec = id => specs[id].illustrativeGeometryM;
  function mat(color, extra = {}) {
    const key = JSON.stringify([color,extra]);
    if (!materials.has(key)) materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.72,...extra}));
    return materials.get(key);
  }
  function box(w,h,d,x,y,z,color,parent=activeParent,extra={}) {
    const key = [w,h,d].join(',');
    if (!geometry.has(key)) geometry.set(key,new THREE.BoxGeometry(w,h,d));
    const mesh = new THREE.Mesh(geometry.get(key),mat(color,extra));
    mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
  }
  function cylinder(radius,height,x,y,z,color,parent=activeParent,segments=16) {
    const key='c'+[radius,height,segments].join(',');
    if(!geometry.has(key))geometry.set(key,new THREE.CylinderGeometry(radius,radius,height,segments));
    const mesh=new THREE.Mesh(geometry.get(key),mat(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function sign(lines,width,height,x,y,z,parent=activeParent,rotation=0) {
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#15316e';ctx.fillRect(0,0,1024,512);
    const gradient=ctx.createLinearGradient(0,0,1024,512);gradient.addColorStop(0,'#204bd5');gradient.addColorStop(1,'#0e2455');ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,512);
    ctx.fillStyle='#fff';ctx.textAlign='center';lines.forEach((line,i)=>{ctx.font=`${i===0?'700 85':'500 36'}px sans-serif`;ctx.fillText(line,512,165+i*100,930);});
    ctx.strokeStyle='#8db4ff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,435);ctx.bezierCurveTo(330,300,600,580,1024,320);ctx.stroke();
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;ownedTextures.push(texture);
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
    mesh.position.set(x,y,z);mesh.rotation.y=rotation;parent.add(mesh);return mesh;
  }
  function plant(x,z) {
    cylinder(.25,.45,x,.225,z,0xf0eee7);
    for(let i=0;i<9;i++){const a=i*2.4;const leaf=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),mat(i%2?0x397b46:0x245c37));leaf.scale.set(1,2.5,.5);leaf.rotation.z=Math.sin(a)*.55;leaf.position.set(x+Math.sin(a)*.25,.65+i*.1,z+Math.cos(a)*.25);activeParent.add(leaf);}
  }
  function chair(x,z,rotation=0,parent=room,y=0,stage=false) {
    const s=spec(stage?'stage-chair':'event-chair');const group=new THREE.Group();parent.add(group);group.position.set(x,y,z);group.rotation.y=rotation;
    const width=s.width,depth=s.depth,seat=s.seatHeight;
    box(width,.09,depth,0,seat,0,stage?0x5b6373:c.chair,group);
    box(width,s.height-seat,.09,0,seat+(s.height-seat)/2,depth/2-.04,stage?0x5b6373:c.chair,group);
    for(const xx of [-width*.38,width*.38])for(const zz of [-depth*.35,depth*.35])box(.025,seat,.025,xx,seat/2,zz,c.black,group);
    if(stage)for(const xx of [-width*.45,width*.45])box(.12,.16,depth,xx,seat+.15,0,0x5b6373,group);
    return group;
  }
  function table(x,z,blue=false) {
    const s=spec('folding-table-6ft'),group=new THREE.Group();group.position.set(x,0,z);room.add(group);
    box(s.length,.04,s.width,0,s.height,0,blue?c.blue:c.white,group);
    for(const xx of [-s.length*.39,s.length*.39])for(const zz of [-s.width*.35,s.width*.35])box(.04,s.height-.02,.04,xx,(s.height-.02)/2,zz,c.steel,group);
    // Tailored edge and visible commercial frame, rather than a solid floor-reaching block.
    box(s.length,.16,.012,0,s.height-.09,-s.width/2,blue?c.blue:c.white,group);
    box(s.length,.16,.012,0,s.height-.09,s.width/2,blue?c.blue:c.white,group);
    box(.3,.02,.22,-.35,s.height+.035,0,c.black,group);
    const laptop=box(.3,.19,.012,-.35,s.height+.12,-.1,0x1d293c,group);laptop.rotation.x=-.15;
    box(.65,.04,.075,.43,s.height+.04,0,0xf1f3f7,group);
    for(let i=0;i<5;i++)box(.04,.006,.025,.19+i*.1,s.height+.063,0,0x697789,group);
  }
  room.add(shell,ceiling);
  // Nominal 54 × 45 m envelope supplied in the source catalogue; usable area is unverified.
  box(54,.12,45,0,-.07,0,c.floor);
  for(const x of [-27,27]){
    box(.24,9,45,x,4.5,0,c.cream,shell);
    box(.35,.45,45,x,6.2,0,c.trim,shell);
    for(let z=-17;z<=17;z+=4.2){
      box(.15,3.4,1.95,x-Math.sign(x)*.16,4.3,z,c.glazing,shell,{roughness:.18,metalness:.25});
      box(.2,3.45,.05,x-Math.sign(x)*.26,4.3,z,0x204b66,shell);
      box(.2,.05,1.95,x-Math.sign(x)*.26,4.3,z,0x204b66,shell);
    }
  }
  for(const z of [-22.5,22.5]){
    box(54,9,.24,0,4.5,z,c.cream,shell);box(54,.45,.4,0,6.2,z,c.trim,shell);
    for(let x=-23;x<=23;x+=3.5)box(1.7,3.1,.18,x,4.4,z-Math.sign(z)*.16,c.glazing,shell,{roughness:.2,metalness:.2});
    for(const x of [-12,12]){
      box(5.5,3.1,.2,x,1.55,z-Math.sign(z)*.24,0x36718c,shell);
      for(const dx of [-2.65,0,2.65])box(.08,3.1,.28,x+dx,1.55,z-Math.sign(z)*.36,0x284d61,shell);
      box(5.5,.08,.28,x,2.6,z-Math.sign(z)*.36,0x284d61,shell);
    }
  }
  box(54,.15,45,0,9,0,c.cream,ceiling);
  const lines=[];
  for(let x=-27;x<=27;x+=1.2)lines.push(x,8.9,-22.5,x,8.9,22.5);
  for(let z=-22.5;z<=22.5;z+=1.2)lines.push(-27,8.9,z,27,8.9,z);
  const grid=new THREE.BufferGeometry();grid.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
  ceiling.add(new THREE.LineSegments(grid,new THREE.LineBasicMaterial({color:0xc3bcae,transparent:true,opacity:.7})));
  for(let x=-24;x<=24;x+=6)for(let z=-18;z<=18;z+=6){box(.5,.035,.5,x,8.86,z,0xffffff,ceiling,{emissive:0xffffff,emissiveIntensity:.7});}

  room.add(stageGroup);stageGroup.position.z=-1.6288;stageGroup.visible=hall==='B';activeParent=stageGroup;
  const stage=spec('stage'),led=spec('main-led');box(stage.width,stage.height,stage.depth,0,stage.height/2,-17.5,c.black);
  for(let x=-stage.width/2;x<=stage.width/2;x+=.2)box(.018,stage.height,.045,x,stage.height/2,-17.5+stage.depth/2+.03,0x131820);
  const drapeWidth=Math.max(stage.width,led.width)+3,drapeHeight=led.height+1.8,ledCenter=stage.height+.5+led.height/2;
  box(drapeWidth,drapeHeight,.16,0,stage.height+drapeHeight/2,-19.3,0x141821);
  for(let x=-drapeWidth/2;x<=drapeWidth/2;x+=.22)box(.02,drapeHeight,.08,x,stage.height+drapeHeight/2,-19.18,0x232832);
  box(led.width+.2,led.height+.2,.2,0,ledCenter,-19.05,0x090d17);
  sign(['ATLAS','AGENTIC AI HACKATHON','INTELLIBUS · JAMAICA 2027'],led.width,led.height,0,ledCenter,-18.9);
  for(const x of [-3,0,3])chair(x,-16.9,Math.PI,stageGroup,stage.height,true);
  const podium=spec('acrylic-podium');box(podium.width,.05,podium.depth,5,stage.height+.04,-16.8,0xcef0ff,stageGroup,{transparent:true,opacity:.45,roughness:.12});
  box(.08,podium.height,podium.depth*.7,5,stage.height+podium.height/2,-16.8,0xcef0ff,stageGroup,{transparent:true,opacity:.38,roughness:.1});
  box(podium.width,.05,podium.depth,5,stage.height+podium.height,-16.8,0xcef0ff,stageGroup,{transparent:true,opacity:.55,roughness:.1});
  cylinder(.012,.35,5,stage.height+podium.height+.175,-16.8,c.black);
  for(const x of [-9,9]){
    cylinder(.04,2.5,x,1.25,-17,c.black);box(.65,1.8,.5,x,2.8,-17,c.black);
    for(let y=2;y<3.6;y+=.3)box(.63,.025,.02,x,y,-16.74,0x505864);
    plant(x*1.3,-16.5);
    box(.35,.35,.4,x,5.9,-19,c.black);box(.21,.12,.04,x,5.8,-18.78,0xd8e8ff,stageGroup,{emissive:0xd8e8ff});
  }
  for(const x of [-5,5])box(.55,.3,.4,x,stage.height+.15,-16,c.black);

  activeParent=room;
  const sourceLayout=addCadLayout(THREE,root,cad,hall,specs);
  // Protected cable crossing: a conceptual position, not electrical/egress sign-off.
  box(30,.05,.5,0,.025,11.5,0x272c35);
  for(let x=-14.5;x<=14.5;x++)box(.22,.008,.48,x,.055,11.5,0xf2ca47);
  const desk=spec('sit-stand-desk');
  for(const x of [18,20]){
    box(desk.width,.025,desk.depth,x,desk.height,8,c.white);
    for(const xx of [-.5,.5])box(.07,desk.height,.12,x+xx,desk.height/2,8,c.steel);
    box(.75,.18,.6,x,desk.height+.1,8,0x263040);chair(x,9.1,0);
  }
  box(5.8,2.5,.12,19.5,1.25,10.8,c.black);sign(['PRODUCTION','CREW AREA'],3,1,19.5,1.6,10.7,room,Math.PI);
  cylinder(.04,1.5,16, .75,6,c.black);box(.25,.16,.38,16,1.65,6,c.black);
  for(const a of [0,2.1,4.2]){const leg=box(.03,1.6,.03,16+Math.sin(a)*.25,.75,6+Math.cos(a)*.25,c.black);leg.rotation.z=Math.sin(a)*.3;}
  const counter=spec('acrylic-counter');
  for(const x of [-19,-16]){
    box(counter.width,.06,counter.depth,x,counter.height,17,0xe1f2ff,room,{transparent:true,opacity:.6});
    box(counter.width,counter.height,.07,x,counter.height/2,17.15,0xd7ecfc,room,{transparent:true,opacity:.5});
    box(.5,1.15,.42,x-.2,.575,18.7,c.white);box(.4,.45,.08,x-.2,1.4,18.7,c.black);
  }
  sign(['WELCOME','ATLAS / INTELLIBUS'],2.2,1.6,-17.5,2.5,20.7,room,Math.PI);
  for(const x of [-22,23]){
    plant(x,18);box(.35,1.1,.4,x, .55,15,c.white);cylinder(.13,.3,x,1.25,15,0xafd9ef);
  }
  sign(['ATLAS','START HERE'],.8,2,-22,1.1,19.5,room,Math.PI);
  for(const x of [-8,8]){box(1.5,.85,.04,x,.95,-8,c.white);for(const xx of [-.6,.6])box(.04,1.6,.04,x+xx,.8,-8,c.steel);}
  const ambient=new THREE.HemisphereLight(0xeaf4ff,0xb5a993,2.2);
  const sun=new THREE.DirectionalLight(0xfff2db,2.4);sun.position.set(-12,16,13);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=30;sun.shadow.camera.bottom=-30;sun.shadow.camera.far=65;sun.shadow.bias=-.0005;
  const fill=new THREE.DirectionalLight(0xd8eaff,1.5);fill.position.set(24,6,-18);
  root.add(ambient,sun,fill);sun.position.x+=center[0];sun.position.z+=center[1];sun.target.position.set(center[0],0,center[1]);root.add(sun.target);fill.position.x+=center[0];fill.position.z+=center[1];
  return {
    room:root,center,hall,sourceLayout,
    setOverview(value){shell.visible=!value;ceiling.visible=!value;},
    dimensions:{nominalWidth:54,nominalDepth:45,heightIllustrative:9,clearUsableAreaVerified:false},
    statistics:{originalTables:sourceLayout.tables.length,originalChairMarks:sourceLayout.chairMarks.length,tablesPerGroup:4,tableLengthM:1.8288,tableWidthM:.9144,sofas:0},
    dispose(){const gs=new Set(),ms=new Set();root.traverse(node=>{if(node.geometry)gs.add(node.geometry);if(node.material)for(const m of Array.isArray(node.material)?node.material:[node.material])ms.add(m);});for(const g of gs)g.dispose();for(const m of ms)m.dispose();for(const t of ownedTextures)t.dispose();}
  };
}
