import {conceptKit} from './concept-kit.js';

export function buildConceptSpace(THREE,specs,key){
  const k=conceptKit(THREE,specs),{room,walls,ceiling,C,spec,box,cylinder,rounded,sign,chair,foldingTable,plant,water,bistro,coffee,sofa,cot,whiteboard}=k;
  if(key==='registration'){
    k.interior(12,28,5,{glazed:true});
    for(const z of[-10,-3,4,11])for(const x of[-5.6,5.6]){box(.4,5,.4,x,2.5,z,C.cream);box(.6,.3,.6,x,4.8,z,C.wood);}
    const c=spec('acrylic-counter');for(const x of[-2.4,2.4]){box(c.width,c.height,.07,x,c.height/2,-3,C.glass,room,{transparent:true,opacity:.5});box(c.width,.05,c.depth,x,c.height,-3,C.white);const kiosk=spec('registration-kiosk');box(kiosk.width,kiosk.height*.75,kiosk.depth,x,.55,1,C.white);box(kiosk.width*.85,.42,.09,x,1.3,1,C.dark);sign(['WELCOME','CHECK IN'],.44,.22,x,1.3,1.05);}
    sign(['ATLAS / INTELLIBUS','PROPOSED REGISTRATION'],5,1.8,0,3.1,-7);for(const x of[-4.5,4.5])plant(x,-5);water(4.5,6);return complete({counters:2,kiosks:2});
  }
  if(key==='judges-vip'){
    // Open allocation study: no invented measured room boundary or certified fourteen-sofa fit.
    k.floor(34,24,0xb3a79b);box(34,5,.15,0,2.5,-11,C.cream,walls);for(let x=-16;x<=16;x+=2.8){box(.18,5,.2,x,2.5,-10.9,C.wood,walls);box(2.5,.9,.2,x+1,.45,-10.85,C.wood,walls);}
    sign(['JUDGES / VIP','7 SA-50 + 7 SA-21 · ALLOCATION STUDY'],8,2,0,3.6,-10.7);
    let unit=0;for(const[z,xs]of[[-4,[-12,-4,4,12]],[5,[-8,0,8]]])for(const x of xs){unit++;sofa('SA-50',x,z+1.9,0,unit);sofa('SA-21',x,z-1.9,Math.PI,unit);box(2.4,.008,1.8,x,.006,z,C.blue);coffee(x,z);plant(x+2.5,z);}
    for(const x of[-14,14])bistro(x,8.8);water(15,-8);return complete({sofas:14,sofaSA50:7,sofaSA21:7,allocationStudy:true,roomFitVerified:false});
  }
  if(key==='rest-wellness'){
    k.interior(30,24,7,{wood:true,carpet:true});
    for(let x=-12;x<=12;x+=6)for(let z=-8;z<=8;z+=8){box(3.8,.15,3.8,x,6.8,z,C.wood,ceiling);box(3.3,.16,3.3,x,6.72,z,0xdfc99f,ceiling);}
    let unit=0;for(const x of[-10,-6,-2,2])for(const z of[-7,-3,1,5])cot(x,z,++unit);
    box(.1,2.5,18,6,1.25,0,C.dark);sign(['REST / WELLNESS','REPRESENTATIVE SETUP · CAPACITY UNCONFIRMED'],5,1.7,-5,3.1,-10.5);
    const table=spec('massage-table');box(table.length,.08,table.width,10,table.height,-6,C.white);for(const dx of[-.6,.6])box(.05,table.height,.5,10+dx,table.height/2,-6,C.dark);
    const mc=spec('automatic-massage-chair');rounded(mc.width,.5,mc.depth,10,.1,0,C.gray);const back=rounded(mc.width,.75,.22,10,.4,.5,C.dark);back.rotation.x=-.25;
    const pc=spec('massage-therapy-chair');box(pc.width,.12,.45,10,.7,4,C.gray);box(.2,.45,.35,10,1.05,4.35,C.gray);for(const dx of[-.2,.2])box(.04,.75,.04,10+dx,.375,4,C.dark);
    plant(12.5,8);plant(7.8,-9);water(11,8);cylinder(.08,.22,12,.11,7,C.white);return complete({representativeCots:16,capacityVerified:false});
  }
  if(key==='covered-dining'){
    k.floor(11,32,0xbebaaa);for(const z of[-13,-5,3,11])for(const x of[-5,5]){box(.85,3.5,.85,x,1.75,z,0xb0a894);box(1,1,.96,x,.5,z,0x8e8d7b);}
    for(const x of[-5,5])box(.4,.4,32,x,3.6,0,C.cream,ceiling);box(11,.12,32,0,4.3,0,0x62685d,ceiling);for(let z=-14;z<16;z+=2)box(11,.18,.15,0,4.1,z,C.dark,ceiling);
    for(const x of[-2.8,2.8])for(const z of[-9,-4,1,6]){foldingTable(x,z,(z+9)%2===0);for(const dx of[-.55,.55]){chair(x+dx,z-.95,Math.PI);chair(x+dx,z+.95,0);}}
    sign(['PROPOSED DINING','COVERED WALKWAY REFERENCE'],4,1.4,0,2.5,-14);for(const z of[-12,10]){plant(4.2,z);plant(-4.2,z);}water(4.2,13);return complete({representativeDiningTables:8,roomFitVerified:false});
  }
  if(key==='private-meeting'){
    k.interior(11,9,4.5,{wood:true,carpet:true});const table=cylinder(1,.09,0,.75,0,0x75503e);table.scale.set(2.4,1,1.2);cylinder(.3,.72,0,.36,0,C.dark);
    for(let i=0;i<10;i++){const a=i*Math.PI/5,x=Math.sin(a)*3.1,z=Math.cos(a)*1.75;chair(x,z,Math.atan2(x,z));box(.22,.02,.15,x*.6,.81,z*.5,C.blue);cylinder(.025,.16,x*.62,.89,z*.5,C.glass);}
    const ring=k.mesh(new THREE.TorusGeometry(1.3,.06,8,40),k.mat(C.gold),0,3.55,0);ring.rotation.x=Math.PI/2;cylinder(.025,.75,0,4,0,C.gold);
    whiteboard(4,-2,-Math.PI/2);sign(['PRIVATE MEETING','SOURCE-INSPIRED BOARDROOM'],3.4,1.1,0,2.4,-4.25);plant(-4,3);water(4,3);return complete({representativeMeetingChairs:10,sofas:0});
  }
  if(key==='small-business'){
    k.interior(18,18,6,{glazed:true});for(const x of[-8,8])for(const z of[-5,3])box(.45,6,.45,x,3,z,C.cream);
    const booth=spec('modular-booth-small');for(const x of[-5,5]){box(booth.width,.08,booth.depth,x,.04,-5,C.blue);box(booth.width,booth.height,.07,x,booth.height/2,-6.5,C.white);box(.07,booth.height,booth.depth,x-booth.width/2,booth.height/2,-5,C.white);sign(['EXHIBITION POD','SAMPLE / UNASSIGNED'],2,.8,x,1.8,-6.42);foldingTable(x,-5);}
    for(const x of[-4,4])for(const z of[1,6])bistro(x,z);
    box(3,.28,1.8,0,.14,-7.5,C.dark);sign(['SMALL BUSINESS HUB','PROPOSED JAMAICA ROOM SETUP'],4,1.5,0,3,-8.5);whiteboard(-7,7);plant(7,7);water(7,2);return complete({representativeExhibitionPods:2,quantityConfirmed:false});
  }
  if(key==='exterior-arrival'){
    k.floor(64,52,0xc9c5b5);box(52,8,10,0,4,-17,C.cream,walls);for(let x=-24;x<=24;x+=4){box(2.4,4,.15,x,3.2,-11.9,C.glass,walls);box(.3,8,.35,x,4,-11.6,0xd9ccb2,walls);}
    box(11,4.5,.16,0,2.25,-11.7,0x387a96,walls);sign(['INTELLIBUS','ATLAS · PROPOSED ARRIVAL'],12,2.2,0,6.2,-11.5);
    for(const x of[-9,9])for(const z of[1,8,15]){cylinder(.04,3.2,x,1.6,z,C.dark);sign(['ATLAS','JAMAICA 2027'],.7,2,x+.36,2,z);}
    for(const x of[-22,22])for(const z of[-4,12]){cylinder(.22,6,x,3,z,0x8b7254);for(let i=0;i<9;i++){const a=i*Math.PI*2/9,leaf=k.mesh(new THREE.SphereGeometry(.4,8,5),k.mat(0x3a7448),x+Math.sin(a)*1.4,5.8,z+Math.cos(a)*1.4);leaf.scale.set(3,.22,1);leaf.rotation.y=-a;}}
    for(let x=-4;x<=4;x+=2)box(.9,.025,.9,x,.02,14,C.blue);return complete({representativeBanners:6,installationVerified:false},true);
  }
  throw new Error('Unknown concept space.');
  function complete(stats,outdoor=false){k.lights(outdoor);return k.finish(key,stats);}
}
