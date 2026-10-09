/* Isolated browsers only: actual rendered reversal, native scrolling, interruption and complete storage equality. */
const pw=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base=process.env.ATLAS_URL||'http://127.0.0.1:8775',engine=process.env.ATLAS_BROWSER||'chromium',folder=process.env.ATLAS_EVIDENCE_DIR||'/tmp',axe=process.env.ATLAS_AXE_PATH;
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname)) throw Error('Local fixtures only.');
const results={base,engine,motion:[],accessibility:[],interruptions:[],fallbacks:[],pageErrors:[],productionRecordMutations:0,productionSharedDocumentReads:0};
const storage=p=>p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
const snapshot=p=>p.evaluate(()=>AtlasSave.snapshot());
const state=p=>p.evaluate(()=>AtlasHomeScene.state());
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
async function open(browser,width,options={}) {
  const c=await browser.newContext({viewport:{width,height:900},hasTouch:true,reducedMotion:'no-preference',...options});
  // This disposable profile starts with an existing appearance preference, so exercising
  // the real theme toggle can return every storage key to its exact starting value.
  await c.addInitScript(()=>{if(!localStorage.getItem('atlas-appearance'))localStorage.setItem('atlas-appearance','light');});
  await c.route('**/*',r=>{const q=r.request(),u=new URL(q.url());return !['GET','HEAD'].includes(q.method())||!['127.0.0.1','localhost'].includes(u.hostname)||/^\/api\/team-(plan|operations|activity)$/.test(u.pathname)?r.abort():r.continue();});
  const p=await c.newPage();p.on('pageerror',e=>results.pageErrors.push({width,message:e.message}));
  return {c,p};
}
async function home(p) {await p.goto(base+'/index.html');await p.waitForFunction(()=>window.AtlasHomeScene?.state());}
async function pose(p,n) {
  await p.evaluate(n=>{const root=document.querySelector('.home-scroll-journey'),stage=root.querySelector('.home-scroll-stage');window.scrollTo({top:scrollY+root.getBoundingClientRect().top-parseFloat(getComputedStyle(stage).top)+(root.offsetHeight-stage.offsetHeight)*n,behavior:'instant'});},n);
  await p.waitForFunction(n=>Math.abs(AtlasHomeScene.state().progress-n)<.005,n);
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function audit(p,width,mode) {
  if(!axe)return;
  await p.addScriptTag({path:axe});
  const violations=await p.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  assert.deepEqual(violations,[],width+' '+mode);
  results.accessibility.push({width,mode,passed:true});
}
(async()=>{
  const browser=await pw[engine].launch({headless:true,...(engine==='chromium'?{channel:'chrome'}:{})});
  try {
    for(const width of [1440,720,390,320]) {
      const {c,p}=await open(browser,width);await home(p);
      assert.equal((await state(p)).renderer,'webgl','Motion must actually render in this engine');
      if(width>900)await p.locator('#atlas-menu-toggle').click();
      await p.waitForTimeout(400);
      const before=await snapshot(p),saved=await storage(p),hashes=[];
      for(const fraction of [0,.2,.55,.85,1,.55,0]) {
        await pose(p,fraction);
        const current=await state(p);
        const png=await p.locator('.home-scene-visual canvas').screenshot();
        hashes.push({fraction,hash:digest(png),phase:current.phase});
        assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        if(width===1440 && [0,.55,1].includes(fraction) && hashes.length<=5)await p.screenshot({path:path.join(folder,engine+'-desktop-pose-'+fraction+'.png')});
        if(width===390 && [0,.55,1].includes(fraction) && hashes.length<=5)await p.screenshot({path:path.join(folder,engine+'-mobile-pose-'+fraction+'.png')});
      }
      assert.equal(hashes[0].hash,hashes[6].hash,'Returning to zero must reproduce the exact rendered image');
      assert.equal(hashes[2].hash,hashes[5].hash,'Returning to the middle must reproduce the exact rendered image');
      assert.equal(new Set(hashes.slice(0,5).map(x=>x.hash)).size,5,'Scroll positions must visibly change the scene');
      await pose(p,.2);const first=await state(p),scroll=await p.evaluate(()=>scrollY);
      await p.mouse.wheel(0,90);await p.waitForFunction(old=>scrollY>old,scroll);await p.waitForFunction(old=>AtlasHomeScene.state().progress>old,first.progress);
      await p.mouse.wheel(0,-90);await p.waitForFunction(old=>AtlasHomeScene.state().progress<old,first.progress+.01);
      await pose(p,.55);await p.waitForTimeout(300);const idle=(await state(p)).draws;await p.waitForTimeout(300);assert.equal((await state(p)).draws,idle,'No continuous idle rendering');
      const fixed=await state(p),height=await p.locator('.home-scroll-journey').evaluate(e=>e.offsetHeight);
      await p.locator('.home-scene-pause').click();assert.equal(await p.locator('.home-scene-pause').getAttribute('aria-pressed'),'true');
      await p.evaluate(()=>scrollBy({top:100,behavior:'instant'}));await p.waitForTimeout(120);assert.equal((await state(p)).progress,fixed.progress);assert.equal(await p.locator('.home-scroll-journey').evaluate(e=>e.offsetHeight),height,'Pausing must not jump the layout');
      await p.locator('.home-scene-pause').click();await p.waitForFunction(old=>AtlasHomeScene.state().progress>old,fixed.progress);
      await audit(p,width,'active-light');
      await p.locator('#atlas-theme-toggle').click();await audit(p,width,'active-dark');await p.locator('#atlas-theme-toggle').click();
      // The skip link is a normal fragment link; it must focus the actual section heading.
      await p.locator('.home-sections-shortcut').focus();await p.keyboard.press('Enter');await p.waitForURL(base+'/index.html#home-sections-title');
      assert.equal(await p.locator('#home-sections-title').evaluate(e=>e===document.activeElement),true);
      const box=await p.locator('#home-sections-title').boundingBox();assert(box.y>=60 && box.y<900);
      await p.goBack();await p.waitForURL(base+'/index.html');await p.waitForFunction(()=>AtlasHomeScene.state()?.renderer==='webgl');assert.equal(await p.locator('.home-scene-visual canvas').count(),1);
      // Changing system preferences while scrolling must release the renderer and remove the extra distance.
      await pose(p,.55);await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>AtlasHomeScene.state()?.renderer==='static' && !document.querySelector('.home-scene-visual canvas'));
      assert.equal(await p.locator('.home-scene-visual canvas').count(),0);assert.equal(await p.locator('.home-scene-still').isVisible(),true);
      assert.equal(await p.locator('.home-scroll-journey').evaluate(e=>e.offsetHeight),await p.locator('.home-scroll-stage').evaluate(e=>e.offsetHeight));
      await audit(p,width,'reduced-motion');
      await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>AtlasHomeScene.state()?.renderer==='webgl');assert.equal(await p.locator('.home-scene-visual canvas').count(),1);
      await pose(p,.85);await p.reload();await p.waitForFunction(()=>AtlasHomeScene.state()?.renderer==='webgl');assert.equal(await p.locator('.home-scene-visual canvas').count(),1);
      assert.deepEqual(await snapshot(p),before);assert.deepEqual(await storage(p),saved);
      results.motion.push({width,hashes,roundTripPixelsIdentical:true,nativeWheel:true,idleRenderingStopped:true,completePlanningSnapshotAndStorageUnchanged:true});
      results.interruptions.push({width,pauseResume:true,skipAndBack:true,reducedAndResume:true,reload:true,singleCanvas:true});
      console.log('PASS',engine,width,'pixel reversal, wheel input, pause/resume, static preference, history, reload and complete storage');await c.close();
    }
    for(const mode of ['unavailable','context-loss','saved-pause']) {
      const {c,p}=await open(browser,390);
      if(mode==='unavailable')await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};});
      if(mode==='saved-pause')await p.addInitScript(()=>localStorage.setItem('atlas-motion-paused','true'));
      await home(p);const before=await snapshot(p),saved=await storage(p);
      if(mode==='context-loss') {
        assert.equal((await state(p)).renderer,'webgl');
        await p.locator('.home-scene-visual canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
      }
      assert.equal((await state(p)).renderer,mode==='saved-pause'?'static':'fallback');assert(await p.locator('.home-scene-still').isVisible());
      assert.equal(await p.locator('.home-scroll-journey').evaluate(e=>e.offsetHeight),await p.locator('.home-scroll-stage').evaluate(e=>e.offsetHeight));
      await audit(p,390,mode);
      await p.locator('.home-sections-shortcut').click();await p.locator('.home-section-workspace').tap();await p.waitForURL(base+'/workspace.html');await p.locator('.workspace-heading').waitFor();
      assert.deepEqual(await snapshot(p),before);assert.deepEqual(await storage(p),saved);
      results.fallbacks.push({mode,stillVisible:true,sectionNavigationWorks:true,completePlanningSnapshotAndStorageUnchanged:true});console.log('PASS',engine,mode,'still fallback, navigation and complete storage');await c.close();
    }
    assert.deepEqual(results.pageErrors,[]);
  } finally {await browser.close();}
})().catch(e=>{results.failure=e.message;console.error(e);process.exitCode=1;}).finally(()=>{results.checkedAt=new Date().toISOString();fs.writeFileSync(path.join(folder,engine+'-scene-results.json'),JSON.stringify(results,null,2));});
