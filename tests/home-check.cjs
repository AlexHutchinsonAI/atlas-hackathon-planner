/* Local fixtures only: whole-card destinations, history, help and complete record preservation. */
const playwright=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.ATLAS_URL||'http://127.0.0.1:8765',baseline=process.env.ATLAS_BASELINE_URL||'http://127.0.0.1:8767',engine=process.env.ATLAS_BROWSER||'chromium',folder=process.env.ATLAS_EVIDENCE_DIR||'/tmp',axePath=process.env.ATLAS_AXE_PATH;
if(![base,baseline].every(url=>['localhost','127.0.0.1'].includes(new URL(url).hostname)))throw Error('Isolated local previews only.');
const destinations=[['workspace','workspace.html'],['people','atlas-reference.html#people/directory'],['operations','atlas-reference.html#notebook'],['transport','atlas-reference.html#transport'],['venue','virtual-walkthrough.html'],['assistant','assistant.html']];
const sections=['direction','outcomes','notebook','people','web','transport','open','exec','story','baseline','mobilize','refs'];
const result={engine,layouts:[],destinations:[],history:[],keyboard:[],tutorial:[],legacyLinks:[],preservation:[],pageErrors:[],productionRecordMutations:0,productionSharedDocumentReads:0};
const snapshot=page=>page.evaluate(()=>AtlasSave.snapshot());
// Operations already remembers the viewed section separately from its planning records.
const records=page=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).filter(k=>k!=='atlas-workbook-v1-view'&&(k==='intellibus-love-speed-universe-v1'||k.startsWith('atlas-workbook-v1')||k.startsWith('atlas-cloud-pending-'))).sort().map(k=>[k,localStorage.getItem(k)])));
function sameRecords(actual,expected){
 const parsed=data=>Object.fromEntries(Object.entries(data).map(([key,value])=>{try{return [key,JSON.parse(value)];}catch{return [key,value];}}));
 const a=parsed(actual),b=parsed(expected),differences=[];
 const compare=(x,y,key)=>{if(require('node:util').isDeepStrictEqual(x,y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'){for(const field of new Set([...Object.keys(x),...Object.keys(y)]))compare(x[field],y[field],key+'.'+field);}else differences.push(key);};
 compare(a,b,'storage');assert.equal(differences.length,0,'Planning storage changed at: '+differences.slice(0,20).join(', '));
}
async function context(browser,width,fixture){
 const context=await browser.newContext({viewport:{width,height:1000},hasTouch:true,reducedMotion:'reduce'});
 await context.route('**/*',route=>{const req=route.request(),url=new URL(req.url());return !['GET','HEAD'].includes(req.method())||url.hostname==='atlas-hackathon-planner.vercel.app'||/^\/api\/team-(plan|operations|activity)$/.test(url.pathname)?route.abort():route.continue();});
 if(fixture)await context.addInitScript(data=>{if(!localStorage.getItem('__home_fixture')){for(const [key,value] of Object.entries(data))localStorage.setItem(key,value);localStorage.setItem('__home_fixture','1');}},fixture);
 return context;
}
async function home(page){await page.goto(base+'/index.html');await page.locator('.home-section-grid').waitFor();}
async function arrived(page,href){
 await page.waitForURL(base+'/'+href);await page.locator('#atlas-menu-toggle').waitFor();
 if(href==='virtual-walkthrough.html')await page.frameLocator('.venue-window iframe').locator('#scene option').first().waitFor({state:'attached'});
}
async function closeMenu(page){if(await page.locator('#atlas-sidebar').isVisible())await page.locator(await page.locator('#atlas-menu-close').isVisible()?'#atlas-menu-close':'#atlas-menu-toggle').click();}
(async()=>{
 const browser=await playwright[engine].launch({headless:true,...(engine==='chromium'?{channel:'chrome'}:{})});
 try{
  const seedContext=await context(browser,1440),seedPage=await seedContext.newPage();
  await seedPage.goto(baseline+'/workspace.html');const command=await snapshot(seedPage);
  command.data.fixtureExtension={note:'Keep this unknown field',attachment:{id:'home-fixture-extension',url:'https://example.test/keep'}};
  const item=command.data.workstreams[0].lists.find(list=>list.items.length).items[0];item.notes='Preserved landing-page fixture note';item.attachments=[{id:'home-fixture-file',name:'Keep original attachment',url:'https://example.test/file'}];
  await seedPage.goto(baseline+'/atlas-reference.html#notebook');for(const section of sections)await seedPage.evaluate(section=>showView(section),section);
  const operations=await snapshot(seedPage);operations.data.plans[Object.keys(operations.data.plans)[0]].fixtureExtension={note:'Keep operations extension',status:'proposed'};
  const fixture=await records(seedPage);fixture['intellibus-love-speed-universe-v1']=JSON.stringify(command.data);fixture['atlas-workbook-v1']=JSON.stringify(operations.data.plans);await seedContext.close();
  const compared=[];
  for(const origin of [baseline,base]){
   const c=await context(browser,1440,fixture),p=await c.newPage();
   await p.goto(origin+'/index.html');const before=await snapshot(p);
   await p.goto(origin+'/workspace.html');assert.deepEqual(await snapshot(p),before);
   await p.goto(origin+'/atlas-reference.html#notebook');for(const section of sections)await p.evaluate(section=>showView(section),section);
   const op=await snapshot(p);await p.goto(origin+'/index.html');assert.deepEqual(await snapshot(p),before);
   compared.push({command:before,operations:op,records:await records(p)});await c.close();
  }
  assert.deepEqual(compared[1],compared[0]);result.preservation.push({type:'Complete command/operations snapshots and planning storage equal baseline, including unknown fields, notes and attachments',passed:true});
  for(const width of [1440,720,390,320]){
   const c=await context(browser,width,fixture),p=await c.newPage();p.on('pageerror',e=>result.pageErrors.push({width,message:e.message}));
   await p.goto(base+'/atlas-reference.html#notebook');for(const section of sections)await p.evaluate(section=>showView(section),section);await home(p);
   const before=await snapshot(p),stored=await records(p);assert.equal(await p.locator('.home-section-card').count(),6);
   for(const [id,href] of destinations)assert.equal(await p.locator('.home-section-'+id).getAttribute('href'),href);
   for(const theme of ['light','dark']){
    if(await p.locator('html').getAttribute('data-theme')!==theme)await p.locator('#atlas-theme-toggle').click();
    for(const open of [false,true]){
     if((await p.locator('#atlas-sidebar').isVisible())!==open)await p.locator('#atlas-menu-toggle').click();
     assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');
     if(axePath){await p.addScriptTag({path:axePath});const violations=await p.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));assert.deepEqual(violations,[]);}
     result.layouts.push({width,theme,menu:open?'open':'closed',passed:true});
     if(theme==='light'&&(!open||width===1440))await p.screenshot({path:path.join(folder,engine+'-'+width+'-'+(open?'menu-open':'home')+'.png'),fullPage:true});
    }
    await closeMenu(p);
   }
   for(const [id,href] of destinations){
    const card=p.locator('.home-section-'+id);
    if(width<900)await card.tap({position:{x:28,y:28}});else await card.click({position:{x:28,y:28}});
    await arrived(p,href);result.destinations.push({width,id,href,input:width<900?'touch':'mouse',passed:true});
    await p.goBack();await p.locator('.home-section-grid').waitFor();assert.deepEqual(await snapshot(p),before);sameRecords(await records(p),stored);
    await p.goForward();await arrived(p,href);await p.reload();await arrived(p,href);await p.goBack();await p.locator('.home-section-grid').waitFor();
    assert.deepEqual(await snapshot(p),before);sameRecords(await records(p),stored);result.history.push({width,id,passed:true});
   }
   await closeMenu(p);await p.locator('#album-open-menu').focus();await p.keyboard.press('Enter');await arrived(p,'workspace.html');await p.goBack();await p.locator('.home-section-grid').waitFor();
   await closeMenu(p);await p.locator('.home-progress-link').click();await arrived(p,'workspace.html#review/progress');await p.goBack();await p.locator('.home-section-grid').waitFor();
   if(width===1440)for(const [id,href] of destinations){await p.locator('.home-section-'+id).focus();assert(await p.locator('.home-section-'+id).evaluate(e=>getComputedStyle(e).outlineStyle!=='none'));await p.keyboard.press('Enter');await arrived(p,href);await p.goBack();await p.locator('.home-section-grid').waitFor();result.keyboard.push({id,passed:true});}
   await closeMenu(p);const tour=p.locator('#atlas-tutorial');await tour.locator('#launch').click();await tour.locator('#skip').click();await tour.locator('#launch').click();
   let steps=0;while(await tour.locator('#panel').isVisible()){
    await p.waitForTimeout(120);assert(await tour.locator('#ring').isVisible());const box=await tour.locator('#panel').boundingBox();assert(box.x>=0&&box.x+box.width<=width+1&&box.y>=0&&box.y+box.height<=1001);
    assert.doesNotMatch(await tour.locator('#panel').innerText(),/album|swipe|slide to/i);
    if(steps===1){await tour.locator('#back').click();await tour.locator('#next').click();}
    await tour.locator('#next').click();if(++steps>8)throw Error('Tutorial did not finish');
   }
   assert.equal(steps,4);await tour.locator('#launch').click();await p.keyboard.press('Escape');assert(await tour.locator('#panel').isHidden());result.tutorial.push({width,steps,passed:true});
   assert.deepEqual(await snapshot(p),before);sameRecords(await records(p),stored);
   // The existing hash redirect can cancel an intermediate request; require the rendered destination.
   await p.goto(base+'/index.html#workspace',{waitUntil:'commit'});await p.locator('#workspace').waitFor();assert.equal(p.url(),base+'/workspace.html');assert.deepEqual(await snapshot(p),before);result.legacyLinks.push({width,passed:true});
   console.log('PASS',engine,width,'home layouts, six direct links, history, help and unchanged complete records');await c.close();
  }
  assert.deepEqual(result.pageErrors,[]);
 }finally{await browser.close();}
 console.log('PASS',engine,JSON.stringify(Object.fromEntries(['layouts','destinations','history','keyboard','tutorial','legacyLinks','preservation'].map(k=>[k,result[k].length]))));
})().catch(e=>{result.failure=e.message;console.error(e);process.exitCode=1;}).finally(()=>fs.writeFileSync(path.join(folder,engine+'-home-results.json'),JSON.stringify(result,null,2)));
