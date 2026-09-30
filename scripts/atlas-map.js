/* Publishable Mapbox token supplied by the account holder for this browser map. */
(() => {
  let generation = 0;
  let map, markers = [], activePopup;
  const styles = {streets:'mapbox://styles/mapbox/streets-v12',satellite:'mapbox://styles/mapbox/satellite-streets-v12',dark:'mapbox://styles/mapbox/dark-v11'};
  const safe = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dispose(){ generation++; markers.forEach(m=>m.remove());markers=[];map?.remove();map=null; }
  function layout(){return `<section class="atlas-map-screen"><div id="atlasMap" aria-label="Interactive Jamaica transport map"></div><details class="map-controls" open><summary>Transport explorer <span>Filters & details</span></summary><div class="map-control-content"><label>Map style<select id="map-style"><option value="streets">Street map</option><option value="satellite">Satellite</option><option value="dark">Dark</option></select></label><label>Transport network<select id="map-category"><option value="all">All transport</option><option value="town">General public</option><option value="highschool">High schools</option><option value="college">Colleges</option><option value="university">Universities</option></select></label><label>Find a pickup<input id="map-search" type="search" placeholder="Search location or parish"></label><div class="map-buttons"><button id="map-fit">Show network</button><button id="map-venue">Venue</button></div><p id="map-feedback" role="status">Loading map…</p><div id="map-pickups"></div><button type="button" id="map-open-planning">Transport & school planning ↗</button><p class="map-disclaimer">Planning locations and travel estimates only. Pickup times and operators are not confirmed.</p></div></details><dialog id="map-planning-dialog" aria-labelledby="map-planning-title"><header class="map-dialog-head"><h2 id="map-planning-title">Transport & school planning</h2><form method="dialog"><button aria-label="Close transport planning">Close ×</button></form></header><div id="map-planning"></div></dialog></section>`;}
  async function mount(points,venue,planning){
    dispose();
    const requestGeneration = generation;
    document.getElementById('map-planning').innerHTML=planning;
    // Full planning layouts get a properly sized top-layer dialog, never a narrow sidebar.
    document.getElementById('map-open-planning').onclick=()=>document.getElementById('map-planning-dialog').showModal();
    let rows=points;
    const feedback=document.getElementById('map-feedback');
    const list=document.getElementById('map-pickups');
    const colors={town:'#087c86',highschool:'#2864d7',college:'#a76e14',university:'#7952ad'};
    let mapFailed=false;
    function locate(point){
      if(!map || point.lat==null || point.lng==null)return;
      if(innerWidth < 700) document.querySelector('.map-controls').open=false;
      map.flyTo({center:[point.lng,point.lat],zoom:12,padding:0,offset:innerWidth>800?[-160,60]:[0,70],essential:false});
      activePopup?.remove();
      const el=document.createElement('div');
      el.innerHTML=`<strong>${safe(point.label)}</strong><p>${safe(point.parish||venue.detail)}</p><p>${safe(point.planning||'Event venue')}</p><small>Planning location · verify before dispatch</small>`;
      activePopup=new mapboxgl.Popup({offset:16}).setLngLat([point.lng,point.lat]).setDOMContent(el).addTo(map);
    }
    function fit(){
      if(!map)return;
      const bounds=new mapboxgl.LngLatBounds([venue.lng,venue.lat],[venue.lng,venue.lat]);
      rows.filter(p=>p.lat!=null&&p.lng!=null).forEach(p=>bounds.extend([p.lng,p.lat]));
      map.fitBounds(bounds,{padding:innerWidth>800?{top:60,bottom:60,left:60,right:390}:45,maxZoom:11,duration:600});
    }
    function refresh(){
      const category=document.getElementById('map-category').value,q=document.getElementById('map-search').value.trim().toLowerCase();
      rows=points.filter(p=>(category==='all'||p.category===category)&&`${p.label} ${p.parish}`.toLowerCase().includes(q));
      markers.forEach(m=>m.remove());markers=[];
      const known=rows.filter(p=>p.lat!=null&&p.lng!=null);
      feedback.textContent=`${known.length} mapped / ${rows.length} locations${mapFailed?' · Map unavailable; location list remains available.':''}`;
      list.innerHTML=rows.map((p,i)=>`<button class="map-pickup" data-map-point="${i}" ${p.lat==null||p.lng==null?'disabled':''}><strong>${safe(p.label)}</strong><span>${safe(p.parish)} · ${safe(p.planning||'Time pending')}${p.lat==null?' · Location unverified':''}</span></button>`).join('')||'<p>No matching locations.</p>';
      list.querySelectorAll('[data-map-point]').forEach(b=>b.onclick=()=>locate(rows[Number(b.dataset.mapPoint)]));
      if(map)known.forEach(p=>{const marker=new mapboxgl.Marker({color:colors[p.category]}).setLngLat([p.lng,p.lat]).addTo(map);marker.getElement().setAttribute('aria-label',p.label);marker.getElement().addEventListener('click',()=>locate(p));markers.push(marker);});
    }
    try {
      if(!window.mapboxgl)throw new Error('Map library unavailable');
      const response=await fetch('/api/map-config');
      if(!response.ok)throw new Error('Map configuration unavailable');
      const {token}=await response.json();
      if(requestGeneration!==generation)return;
      if(!token?.startsWith('pk.'))throw new Error('Public map token unavailable');
      mapboxgl.accessToken=token;
      map=new mapboxgl.Map({container:'atlasMap',style:styles.streets,center:[-77.3,18.15],zoom:7.3,attributionControl:false});
      map.addControl(new mapboxgl.NavigationControl(),'top-left');
      map.addControl(new mapboxgl.AttributionControl({compact:true}),'bottom-left');
      map.on('error',()=>{if(requestGeneration!==generation)return;document.getElementById('map-style').disabled=false;mapFailed=true;feedback.textContent='Map could not load. Check connection or Mapbox URL permissions. Pickup records remain available.';});
      map.on('style.load',()=>{
        if(requestGeneration===generation)document.getElementById('map-style').disabled=false;
      });
      map.on('load',()=>{if(requestGeneration!==generation)return;mapFailed=false;refresh();fit();});
      new mapboxgl.Marker({color:'#172c4d'}).setLngLat([venue.lng,venue.lat]).addTo(map).getElement().addEventListener('click',()=>locate({...venue,label:venue.name}));
    }catch(e){mapFailed=true;}
    if(requestGeneration!==generation || !document.getElementById('map-category'))return;
    document.getElementById('map-category').onchange=()=>{refresh();fit();};
    document.getElementById('map-search').oninput=refresh;
    document.getElementById('map-fit').onclick=fit;
    document.getElementById('map-venue').onclick=()=>locate({...venue,label:venue.name});
    document.getElementById('map-style').onchange=e=>{
      if(!map)return;
      // Serialize style changes so asynchronous sprite loads cannot cross into a replacement style.
      e.target.disabled=true;
      map.setStyle(styles[e.target.value],{diff:false});
    };
    refresh();
  }
  window.AtlasMap={layout,mount,dispose};
})();
