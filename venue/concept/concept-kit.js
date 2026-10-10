// Source-inspired schematic furniture. Dimensions marked illustrative stay illustrative.
export function conceptKit(THREE,specs){
  const room=new THREE.Group(),walls=new THREE.Group(),ceiling=new THREE.Group(),textures=[];
  room.add(walls,ceiling);
  const cache=new Map(),materials=new Map(),C={cream:0xeee6d4,wood:0x79503c,blue:0x234dc2,white:0xf5f6f8,gray:0xb5b9bd,dark:0x28313d,glass:0x489cbb,gold:0xc7a45d};
  const spec=id=>specs[id].illustrativeGeometryM;
  function mat(color,extra={}){const key=JSON.stringify([color,extra]);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.8,...extra}));return materials.get(key);}
  function mesh(geometry,material,x,y,z,parent=room){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,x,y,z,color,parent=room,extra={}){const key='b'+[w,h,d];if(!cache.has(key))cache.set(key,new THREE.BoxGeometry(w,h,d));return mesh(cache.get(key),mat(color,extra),x,y,z,parent);}
  function cylinder(radius,height,x,y,z,color,parent=room){const key='c'+[radius,height];if(!cache.has(key))cache.set(key,new THREE.CylinderGeometry(radius,radius,height,20));return mesh(cache.get(key),mat(color),x,y,z,parent);}
  function rounded(w,h,d,x,y,z,color,parent=room){
    const radius=Math.min(.1,w/5,d/5,h/3),key='r'+[w,h,d];
    if(!cache.has(key)){const shape=new THREE.Shape();shape.moveTo(-w/2+radius,-d/2);shape.lineTo(w/2-radius,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+radius);shape.lineTo(w/2,d/2-radius);shape.quadraticCurveTo(w/2,d/2,w/2-radius,d/2);shape.lineTo(-w/2+radius,d/2);shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-radius);shape.lineTo(-w/2,-d/2+radius);shape.quadraticCurveTo(-w/2,-d/2,-w/2+radius,-d/2);const g=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.02,h-2*radius),bevelEnabled:true,bevelSize:radius*.5,bevelThickness:radius,bevelSegments:3,steps:1,curveSegments:5});g.rotateX(-Math.PI/2);cache.set(key,g);}
    return mesh(cache.get(key),mat(color),x,y+radius,z,parent);
  }
  function sign(lines,w,h,x,y,z,rotation=0,parent=room){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#16336f';ctx.fillRect(0,0,1024,512);ctx.fillStyle='#fff';ctx.textAlign='center';lines.forEach((line,i)=>{ctx.font=`${i===0?'700 65':'500 33'}px sans-serif`;ctx.fillText(line,512,165+i*110,950);});ctx.fillStyle='#6ba4ff';ctx.fillRect(80,440,864,5);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);const m=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}),x,y,z,parent);m.rotation.y=rotation;return m;
  }
  function chair(x,z,rotation=0,parent=room){const s=spec('event-chair'),g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);rounded(s.width,.08,s.depth,0,s.seatHeight,0,0x717e89,g);rounded(s.width,s.height-s.seatHeight,.1,0,s.seatHeight,s.depth/2-.05,0x717e89,g);for(const xx of[-s.width*.38,s.width*.38])for(const zz of[-s.depth*.35,s.depth*.35])box(.025,s.seatHeight,.025,xx,s.seatHeight/2,zz,C.dark,g);return g;}
  function foldingTable(x,z,blue=false,parent=room){const s=spec('folding-table-6ft'),g=new THREE.Group();g.position.set(x,0,z);parent.add(g);box(s.length,.04,s.width,0,s.height,0,blue?C.blue:C.white,g);for(const xx of[-s.length*.39,s.length*.39])for(const zz of[-s.width*.35,s.width*.35])box(.035,s.height,.035,xx,s.height/2,zz,C.dark,g);return g;}
  function plant(x,z,height=1.5){const g=new THREE.Group();g.position.set(x,0,z);room.add(g);cylinder(.24,.4,0,.2,0,0xe8e5df,g);for(let i=0;i<10;i++){const a=i*2.4,m=mesh(new THREE.SphereGeometry(.17,8,6),mat(i%2?0x367947:0x245d38),Math.sin(a)*.25,.6+i*.075,Math.cos(a)*.25,g);m.scale.set(1,2.3,.55);m.rotation.z=Math.sin(a)*.45;}g.scale.y=height/1.5;return g;}
  function water(x,z){const s=spec('water-dispenser');box(s.width,s.height,s.depth,x,s.height/2,z,C.white);cylinder(.13,.3,x,s.height+.15,z,0xadd8ef);box(.12,.12,.05,x,.65,z+s.depth/2,C.dark);}
  function bistro(x,z){const s=spec('bistro-table');cylinder(s.diameter/2,.05,x,s.height,z,C.white);cylinder(.045,s.height,x,s.height/2,z,C.dark);cylinder(.25,.025,x,.013,z,C.dark);for(const angle of[0,Math.PI]){const xx=x+Math.cos(angle)*.7,zz=z+Math.sin(angle)*.7,st=spec('swivel-stool');cylinder(.2,.07,xx,st.seatHeight,zz,C.dark);cylinder(.035,st.seatHeight,xx,st.seatHeight/2,zz,0x647281);cylinder(.21,.025,xx,.013,zz,0x647281);}}
  function coffee(x,z){const s=spec('coffee-table');rounded(s.width,.06,s.depth,x,s.height,z,0x555e69);for(const dx of[-s.width*.35,s.width*.35])box(.04,s.height,.35,x+dx,s.height/2,z,C.dark);}
  function sofa(type,x,z,rotation=0,unit=1){
    const id=type==='SA-50'?'sofa-sa50-reference':'sofa-sa21-reference',s=spec(id),g=new THREE.Group();g.name=type+' '+unit;g.userData={catalogId:id,allocationUnit:unit,dimensionsIllustrative:true};g.position.set(x,0,z);g.rotation.y=rotation;room.add(g);
    if(type==='SA-50'){
      rounded(s.width,.25,s.depth,0,.02,0,C.gray,g);
      for(let i=-1;i<=1;i++){const seat=new THREE.Group();seat.position.set(i*s.width*.29,.25,Math.abs(i)*-.12);seat.rotation.y=-i*.13;g.add(seat);rounded(s.width*.29,.18,s.depth*.76,0,0,-.08,0xc4c7c9,seat);rounded(s.width*.31,s.height-.25,.23,0,0,s.depth*.35,C.gray,seat);}
      for(const xx of[-s.width*.46,s.width*.46])rounded(.2,.4,s.depth*.8,xx,.2,0,C.gray,g);
    }else{
      const shape=new THREE.Shape(),w=s.width,d=s.depth;shape.moveTo(-w/2+.25,-d/2);shape.bezierCurveTo(-w/2-.1,-d/2,-w/2-.05,d/2-.1,-w/2+.3,d/2);shape.bezierCurveTo(-w/4,d/2+.15,w/4,d/2+.15,w/2-.2,d/2-.12);shape.bezierCurveTo(w/2+.15,d/2-.2,w/2+.05,-d/2-.4,w/2-.35,-d/2-.35);shape.bezierCurveTo(w/4,-d/2-.2,-w/4,-d/2+.2,-w/2+.25,-d/2);
      const base=new THREE.ExtrudeGeometry(shape,{depth:s.seatHeight,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:3,curveSegments:14});base.rotateX(-Math.PI/2);mesh(base,mat(0xbfc3c6),0,.07,0,g);
      for(let i=-3;i<=3;i++){const xx=i*s.width/7,back=new THREE.Group();back.position.set(xx,s.seatHeight,.45-Math.abs(i)*.035);back.rotation.y=-i*.08;g.add(back);rounded(s.width/6,s.height-s.seatHeight,.24,0,0,0,C.gray,back);}
      rounded(.25,.55,s.depth*.85,-s.width*.43,.25,.05,C.gray,g);
    }
    return g;
  }
  function cot(x,z,unit){const s=spec('sleeping-cot'),g=new THREE.Group();g.position.set(x,0,z);g.name='Representative cot '+unit;g.userData.catalogId='sleeping-cot';room.add(g);box(s.length,.05,s.width,0,s.height,0,0x6b7582,g);for(const xx of[-s.length*.36,s.length*.36])for(const zz of[-s.width*.4,s.width*.4])box(.03,s.height,.03,xx,s.height/2,zz,C.dark,g);box(1.524,.015,s.width,-.08,s.height+.035,0,C.blue,g);for(const zz of[-s.width/2,s.width/2])box(1.524,.285,.012,-.08,s.height-.105,zz,C.blue,g);const p=spec('mini-pillow');rounded(p.width,p.height,p.depth,s.length*.32,s.height+.06,0,C.white,g);return g;}
  function whiteboard(x,z,rotation=0){const s=spec('mobile-whiteboard'),g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;room.add(g);box(s.width,1,.06,0,1.2,0,C.white,g);for(const dx of[-s.width*.4,s.width*.4]){box(.04,s.height,.04,dx,s.height/2,0,C.dark,g);box(.08,.05,s.depth,dx,.025,0,C.dark,g);}return g;}
  function floor(w,d,color=0xd6d0c3){box(w,.1,d,0,-.06,0,color);}
  function interior(w,d,h,{wood=false,glazed=false,carpet=false}={}){
    floor(w,d,carpet?0xa99b8e:0xd6d0c3);
    for(const x of[-w/2,w/2]){box(.15,h,d,x,h/2,0,C.cream,walls);if(wood)for(let z=-d/2+1;z<d/2;z+=3){box(.2,h,.16,x-Math.sign(x)*.1,h/2,z,C.wood,walls);box(.18,.9,2.7,x-Math.sign(x)*.15,.45,z+.9,C.wood,walls);}if(glazed)for(let z=-d/2+1.5;z<d/2;z+=3){box(.18,h*.7,2.7,x-Math.sign(x)*.1,h*.5,z,C.glass,walls);box(.22,h*.7,.04,x-Math.sign(x)*.2,h*.5,z,0x294c63,walls);}}
    for(const z of[-d/2,d/2]){box(w,h,.15,0,h/2,z,C.cream,walls);if(wood)for(let x=-w/2+1;x<w/2;x+=2.8)box(.18,h,.2,x,h/2,z-Math.sign(z)*.1,C.wood,walls);}
    box(w,.1,d,0,h,0,C.cream,ceiling);for(let x=-w/2+1;x<w/2;x+=3)for(let z=-d/2+1;z<d/2;z+=3)box(.55,.035,.55,x,h-.08,z,0xffffff,ceiling,{emissive:0xffffff,emissiveIntensity:.65});
  }
  function lights(outdoor=false){room.add(new THREE.HemisphereLight(0xebf4ff,0xb7a78a,outdoor?2.8:2.2));const sun=new THREE.DirectionalLight(0xfff4e4,outdoor?3:2.2);sun.position.set(-12,18,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;sun.shadow.camera.far=70;sun.shadow.bias=-.0005;room.add(sun);const fill=new THREE.DirectionalLight(0xdaeaff,1.2);fill.position.set(14,8,-8);room.add(fill);}
  function finish(key,statistics={}){let sofaSA50=0,sofaSA21=0;room.traverse(node=>{if(node.userData.catalogId==='sofa-sa50-reference')sofaSA50++;if(node.userData.catalogId==='sofa-sa21-reference')sofaSA21++;});return{room,center:[0,0],key,hall:null,statistics:{originalTables:0,originalChairMarks:0,...statistics,sofas:sofaSA50+sofaSA21,sofaSA50,sofaSA21},setOverview(value){walls.visible=!value;ceiling.visible=!value;},dispose(){const gs=new Set(),ms=new Set();room.traverse(node=>{node.shadow?.map?.dispose();node.shadow?.mapPass?.dispose();if(node.geometry)gs.add(node.geometry);if(node.material)for(const m of Array.isArray(node.material)?node.material:[node.material])ms.add(m);});for(const g of gs)g.dispose();for(const m of ms)m.dispose();for(const t of textures)t.dispose();}};}
  return{THREE,room,walls,ceiling,C,spec,mat,mesh,box,cylinder,rounded,sign,chair,foldingTable,plant,water,bistro,coffee,sofa,cot,whiteboard,floor,interior,lights,finish};
}
