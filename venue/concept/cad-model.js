// Source X/Y map directly to Three.js X/Z. Only vertical dimensions are conceptual.
export function addCadLayout(THREE,parent,data,hall,specs){
  const tables=data.tables.filter(t=>t.hall===hall),chairMarks=[];
  const materials=[],geometries=[],mat=color=>{const m=new THREE.MeshStandardMaterial({color,roughness:.8});materials.push(m);return m;};
  const tabletop=specs['folding-table-6ft'].illustrativeGeometryM,chair=specs['event-chair'].illustrativeGeometryM;
  const matrix=new THREE.Matrix4(),dummy=new THREE.Object3D();
  function instances(w,h,d,positions,color){const g=new THREE.BoxGeometry(w,h,d),m=mat(color),mesh=new THREE.InstancedMesh(g,m,positions.length);geometries.push(g);positions.forEach((p,i)=>{dummy.position.set(p[0],p[1],p[2]);dummy.rotation.set(0,p[3]||0,0);dummy.updateMatrix();matrix.copy(dummy.matrix);mesh.setMatrixAt(i,matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  const blue=[],white=[],legs=[],seats=[],backs=[],chairLegs=[],powers=[],marks=[];
  for(const t of tables){
    const[x,z]=t.venue_center_m,yaw=t.yaw_radians_in_venue_xy;
    (t.group%2?blue:white).push([x,tabletop.height,z,yaw]);
    for(const dx of [-.72,.72])for(const dz of [-.32,.32])legs.push([x+dx,tabletop.height/2,z+dz,0]);
    powers.push([x,tabletop.height+.05,z,0]);
    for(const mark of t.source_chair_marks){
      const[a,b,c,d]=mark.venue_bounds_m,cx=(a+c)/2,cz=(b+d)/2,angle=Math.atan2(cx-x,cz-z),sin=Math.sin(angle),cos=Math.cos(angle);
      chairMarks.push({tableId:t.id,bounds:[...mark.venue_bounds_m],center:[cx,cz]});
      seats.push([cx,chair.seatHeight,cz,angle]);backs.push([cx+sin*(chair.depth/2-.04),chair.seatHeight+(chair.height-chair.seatHeight)/2,cz+cos*(chair.depth/2-.04),angle]);
      for(const dx of [-chair.width*.38,chair.width*.38])for(const dz of [-chair.depth*.35,chair.depth*.35])chairLegs.push([cx+cos*dx+sin*dz,chair.seatHeight/2,cz-sin*dx+cos*dz,0]);
      marks.push(a,.016,b,c,.016,b,c,.016,b,c,.016,d,c,.016,d,a,.016,d,a,.016,d,a,.016,b);
    }
  }
  instances(1.8288,.04,.9144,blue,0x2049bc);instances(1.8288,.04,.9144,white,0xf5f6f9);instances(.035,tabletop.height-.04,.035,legs,0x36404e);instances(.65,.035,.075,powers,0xf3f4f8);
  instances(chair.width,.08,chair.depth,seats,0x87939d);instances(chair.width,chair.height-chair.seatHeight,.08,backs,0x87939d);instances(.025,chair.seatHeight,.025,chairLegs,0x303945);
  function lines(points,color){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));const m=new THREE.LineBasicMaterial({color});geometries.push(g);materials.push(m);parent.add(new THREE.LineSegments(g,m));}
  lines(marks,0x2660ce);
  for(const column of data.venue_grid.columns.filter(c=>c.hall===hall)){
    const g=new THREE.CylinderGeometry(column.radius_m,column.radius_m,9,24),m=mat(0xeee4cd),mesh=new THREE.Mesh(g,m);geometries.push(g);mesh.position.set(column.center_m[0],4.5,column.center_m[1]);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
  }
  const wells=data.venue_grid.equipment_wells.filter(w=>w.hall===hall),wellLines=[];
  for(const w of wells){const[x,z]=w.center_m,a=w.size_m[0]/2,b=w.size_m[1]/2;wellLines.push(x-a,.02,z-b,x+a,.02,z-b,x+a,.02,z-b,x+a,.02,z+b,x+a,.02,z+b,x-a,.02,z+b,x-a,.02,z+b,x-a,.02,z-b);}
  lines(wellLines,0xaf751a); // Footprint outlines; no assumed flush cover or excavation.
  for(const duplicate of data.additional_original_linework.near_duplicate_table_outlines){if(!duplicate.logical_duplicate_of_table_id.startsWith(hall+'-'))continue;const[x,z]=duplicate.venue_center_m,a=.9144,b=.4572;lines([x-a,.025,z-b,x+a,.025,z-b,x+a,.025,z-b,x+a,.025,z+b,x+a,.025,z+b,x-a,.025,z+b,x-a,.025,z+b,x-a,.025,z-b],0xff8c24);}
  return{tables:tables.map(t=>({id:t.id,center:[...t.venue_center_m],yaw:t.yaw_radians_in_venue_xy})),chairMarks,columns:data.venue_grid.columns.filter(c=>c.hall===hall),wells,assumedTableHeightM:tabletop.height,physicalChairDimensionsAssumed:true};
}
