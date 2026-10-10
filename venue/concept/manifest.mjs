// Concept presentation metadata is separate from original photography and planning records.
const text=value=>typeof value==='string'&&value.trim().length>0;
const vector=value=>Array.isArray(value)&&value.length===3&&value.every(x=>Number.isFinite(x)&&Math.abs(x)<=100);
export function validateManifest(data, sources) {
  if(data?.version!==2||data.kind!=='ai-concept-3d'||data.model!=='multi-space-concept'||!Array.isArray(data.scenes)||!data.scenes.length||!Array.isArray(data.categories)||!Array.isArray(data.hotspots)||!Array.isArray(data.stills))throw new Error('Invalid 3D concept manifest.');
  const categories=new Set(data.categories.map(x=>x.id)),ids=new Set();
  if(categories.size!==data.categories.length||data.categories.some(x=>!text(x.id)||!text(x.title)))throw new Error('Invalid concept categories.');
  for(const scene of data.scenes){
    if(!text(scene.id)||!/^[a-zA-Z0-9-]+$/.test(scene.id)||ids.has(scene.id)||!text(scene.title)||!text(scene.summary)||!categories.has(scene.category)||!['exhibition','registration','judges-vip','rest-wellness','covered-dining','private-meeting','small-business','exterior-arrival'].includes(scene.model)||(scene.model==='exhibition'&&!['A','B'].includes(scene.hall))||!vector(scene.position)||!scene.view||['yaw','pitch','fov'].some(key=>!Number.isFinite(scene.view[key])))throw new Error('Invalid concept camera stop.');
    if(sources&&!sources.some(x=>x.id===scene.sourceViewpointId&&x.name===scene.sourceName))throw new Error('Unknown original reference viewpoint.');
    ids.add(scene.id);
  }
  const hotspots=new Set();
  for(const hotspot of data.hotspots){if(!text(hotspot.id)||hotspots.has(hotspot.id)||!text(hotspot.title)||!text(hotspot.description)||!vector(hotspot.position)||!text(hotspot.model)||(hotspot.sceneId&&!ids.has(hotspot.sceneId)))throw new Error('Invalid spatial concept detail.');hotspots.add(hotspot.id);}
  for(const still of data.stills)if(!text(still.id)||still.panorama!==false||!text(still.title)||!text(still.description)||!/^stills\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(still.url))throw new Error('Invalid concept still reference.');
  for(const scene of data.scenes)if(!data.stills.some(x=>x.id===scene.stillId))throw new Error('Missing concept styling preview.');
  if(!ids.has(data.initialSceneId))throw new Error('Invalid initial concept view.');
  return data;
}
export function validateSpecs(specs){
  const fields={'folding-table-6ft':['length','width','height'],'event-chair':['width','depth','height','seatHeight'],'stage-chair':['width','depth','height','seatHeight'],'sit-stand-desk':['width','depth','height'],'acrylic-podium':['width','depth','height'],'acrylic-counter':['width','depth','height'],'stage':['width','depth','height'],'main-led':['width','height']};
  for(const [id,keys]of Object.entries(fields))for(const key of keys){const value=specs?.[id]?.illustrativeGeometryM?.[key];if(!Number.isFinite(value)||value<=0||value>50)throw new Error('Invalid draft model dimensions.');}
  return specs;
}
export function sceneFromHash(hash,scenes){let id;try{id=decodeURIComponent(hash.replace(/^#/,''));}catch{return null;}return scenes.find(x=>x.id===id)||null;}
export function boundedPose(yaw,pitch,fov){return{yaw:((yaw%360)+540)%360-180,pitch:Math.max(-85,Math.min(85,pitch)),fov:Math.max(35,Math.min(100,fov))};}
export function validateCad(data){
  if(data?.schema!=='mbcc.original_layout_geometry.v1'||!Array.isArray(data.tables)||data.tables.length!==448||!Array.isArray(data.venue_grid?.columns)||data.venue_grid.columns.length!==8||!Array.isArray(data.venue_grid.equipment_wells)||data.venue_grid.equipment_wells.length!==48)throw new Error('Invalid original CAD geometry.');
  const ids=new Set();
  for(const t of data.tables){if(ids.has(t.id)||!['A','B'].includes(t.hall)||!Array.isArray(t.venue_center_m)||t.venue_center_m.length!==2||!t.venue_center_m.every(Number.isFinite)||!Number.isFinite(t.yaw_radians_in_venue_xy)||t.source_chair_marks?.length!==2)throw new Error('Invalid original table geometry.');ids.add(t.id);for(const m of t.source_chair_marks)if(m.symbol_only!==true||m.venue_bounds_m?.length!==4||!m.venue_bounds_m.every(Number.isFinite))throw new Error('Invalid original chair mark.');}
  if(data.tables.filter(t=>t.hall==='A').length!==256||data.tables.filter(t=>t.hall==='B').length!==192)throw new Error('Original hall allocation changed.');
  return data;
}
