/* Local-only checks for collapsed navigation, accurate breadcrumbs and unchanged records. */
const playwright=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.ATLAS_URL||'http://127.0.0.1:8765',engine=process.env.ATLAS_BROWSER||'chromium';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Isolated local preview only.');
const folder=process.env.ATLAS_EVIDENCE_DIR||'/tmp',axePath=process.env.ATLAS_AXE_PATH;
const results={engine,routes:[],accessibility:[],history:[],pageErrors:[],blocked:[],productionRecordMutations:0};
const mainPages=[
 ['index.html','Atlas','Home','index.html'],
 ['workspace.html','Planning workspace','Overview','workspace.html'],
 ['atlas-reference.html#people/directory','People','Directory','atlas-reference.html#people/directory'],
 ['assistant.html','Atlas','Atlas Tech assistant','index.html'],
 ['virtual-walkthrough.html','Venue','Virtual walkthrough','virtual-walkthrough.html'],
 ['venue/index.html','Venue','Venue explorer','../virtual-walkthrough.html']
];
const sections=[['direction','Operations overview'],['outcomes','Event outcomes'],['notebook','Operations register'],['web','Website content'],['transport','Transport'],['open','Follow-up actions'],['exec','Leadership review'],['story','Event background'],['baseline','Planning baseline'],['mobilize','Team mobilisation'],['refs','Source references']];
const reviews=[['progress','Progress'],['owners','Ownership'],['recruitment','Recruitment'],['dependencies','Dependencies'],['decisions','Decisions'],['publication','Website readiness']];
async function recordState(page){return page.evaluate(()=>({snapshot:window.AtlasSave?.snapshot()||null,records:Object.fromEntries(Object.keys(localStorage).filter(k=>k==='intellibus-love-speed-universe-v1'||k.startsWith('atlas-workbook-v1')||k.startsWith('atlas-cloud-pending-')).map(k=>[k,localStorage.getItem(k)]))}));}
async function closed(page){if(await page.locator('#atlas-sidebar').isVisible())await page.locator('#atlas-menu-close').click();await page.waitForFunction(()=>document.querySelector('#atlas-toolbar').getBoundingClientRect().left<.1);}
async function labels(page,section,title){await page.waitForFunction(({section,title})=>document.querySelector('#atlas-current-section')?.textContent===section&&document.querySelector('#atlas-current-page')?.textContent===title,{section,title});}
async function arrive(page,route){await page.goto(base+'/'+route,{waitUntil:'domcontentloaded'});await page.locator('#atlas-menu-toggle').waitFor();if(/walkthrough|venue\/index/.test(route)){const scene=route.startsWith('venue/')?page.locator('#scene option'):page.frameLocator('.venue-window iframe').locator('#scene option');await scene.first().waitFor({state:'attached'});}}
async function check(page,width,route,section,title,href){
 await labels(page,section,title);await closed(page);
 assert.equal(await page.locator('#atlas-current-section').getAttribute('href'),href);
 assert.equal(await page.locator('#atlas-current-page').getAttribute('aria-current'),'page');
 assert.equal(await page.locator('#atlas-menu-toggle').getAttribute('aria-expanded'),'false');
 const before=await recordState(page),geometry=await page.locator('#atlas-menu-toggle').boundingBox();assert(geometry.width>=44&&geometry.height>=44);
 assert(await page.locator('#atlas-toolbar').evaluate(el=>Math.abs(el.getBoundingClientRect().width-innerWidth)<1));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow: '+route);
 await page.locator('#atlas-menu-toggle').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#atlas-menu-toggle').getAttribute('aria-expanded'),'true');assert(await page.locator('#atlas-sidebar').isVisible());
 assert.equal(await page.evaluate(()=>document.activeElement.id),'atlas-menu-close');
 if(width<=900){assert.equal(await page.locator('#atlas-sidebar').getAttribute('aria-modal'),'true');assert(await page.locator('#atlas-toolbar').evaluate(el=>el.inert));await page.keyboard.press('Shift+Tab');assert(await page.locator('#atlas-sidebar').evaluate(el=>el.contains(document.activeElement)));await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'atlas-menu-close');}
 await page.keyboard.press('Escape');await closed(page);assert.equal(await page.evaluate(()=>document.activeElement.id),'atlas-menu-toggle');assert.equal(await page.locator('#atlas-toolbar').evaluate(el=>el.inert),false);
 if(width<600)await page.locator('#atlas-menu-toggle').tap();else await page.locator('#atlas-menu-toggle').click();
 await page.locator('#atlas-menu-close').click();await closed(page);assert.equal(await page.locator('#atlas-menu-toggle').getAttribute('aria-expanded'),'false');
 assert.deepEqual(await recordState(page),before,'Header actions must preserve the entire snapshot and planning storage: '+route);
 results.routes.push({width,route,section,title,passed:true});
}
async function accessibility(page,width,route,theme){
 if(!axePath)return;
 await page.addScriptTag({path:axePath});
 const report=await page.evaluate(()=>axe.run('#atlas-toolbar',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
 assert.deepEqual(report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],'Accessible header: '+route+' '+theme);
 results.accessibility.push({width,route,theme,passed:true});
}
(async()=>{
 const browser=await playwright[engine].launch({headless:true,...(engine==='chromium'?{channel:'chrome'}:{})});
 try{for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:true,reducedMotion:'reduce'});
  await context.route('**/*',route=>{const req=route.request(),url=new URL(req.url());if(!['GET','HEAD'].includes(req.method())||url.hostname==='atlas-hackathon-planner.vercel.app'||/^\/api\/team-(plan|operations|activity)$/.test(url.pathname)){results.blocked.push({method:req.method(),host:url.hostname,path:url.pathname});return route.abort();}return route.continue();});
  const page=await context.newPage();page.on('pageerror',error=>results.pageErrors.push({width,message:error.message}));
  for(const [route,section,title,href] of mainPages){
   await arrive(page,route);await check(page,width,route,section,title,href);
   for(const theme of ['light','dark']){if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('#atlas-theme-toggle').click();await accessibility(page,width,route,theme);if(theme==='light'&&width!==320)await page.screenshot({path:path.join(folder,width+'-'+engine+'-'+route.split('#')[0].replace(/[/.]/g,'-')+'-closed.png')});}
   await page.locator('#atlas-theme-toggle').click();
   if(width<=900){await page.locator('#atlas-menu-toggle').tap();await page.locator('#atlas-sidebar-backdrop').click({position:{x:width-5,y:500}});await closed(page);}
  }
  await arrive(page,'workspace.html');const workstreams=await page.evaluate(()=>AtlasPlannerNavigation.workstreams()),areas=await page.evaluate(()=>AtlasPlannerNavigation.areas());
  const workspaceRoutes=reviews.map(([id,label])=>['#review/'+id,'Delivery review',label,'workspace.html#review/progress']);
  for(const area of areas)workspaceRoutes.push(['#area/'+encodeURIComponent(area.id),'Planning workspace',area.title,'workspace.html']);
  const ws=workstreams[0],wsUrl='workspace.html#workstream/'+encodeURIComponent(ws.id)+'/list';
  for(const [mode,label] of [['list','Lists'],['organize','Organize lists'],['validate','Check lists'],['execute','Work to finish']])workspaceRoutes.push(['#workstream/'+encodeURIComponent(ws.id)+'/'+mode,ws.title,label,wsUrl]);
  workspaceRoutes.push(['#list/'+encodeURIComponent(ws.id)+'/'+encodeURIComponent(ws.lists[0].id),ws.title,ws.lists[0].title,wsUrl]);
  for(const [hash,section,title,href] of workspaceRoutes){await page.evaluate(hash=>{location.hash=hash;},hash);await check(page,width,'workspace.html'+hash,section,title,href);}
  await page.reload();await labels(page,ws.title,ws.lists[0].title);await closed(page);await page.locator('#atlas-current-section').click();await labels(page,ws.title,'Lists');await page.goBack();await labels(page,ws.title,ws.lists[0].title);await page.goForward();await labels(page,ws.title,'Lists');
  results.history.push({width,type:'Workspace parent breadcrumb, reload, Back and Forward',passed:true});
  await arrive(page,'atlas-reference.html#direction');
  for(const [id,title] of sections){await page.evaluate(id=>{location.hash=id;},id);await check(page,width,'atlas-reference.html#'+id,'Operations & delivery',title,'atlas-reference.html#direction');}
  for(const [id,title] of [['directory','Directory'],['stakeholders','Stakeholders'],['map','Communication map'],['schools','Schools & institutions']]){await page.evaluate(id=>{location.hash='people/'+id;},id);await check(page,width,'atlas-reference.html#people/'+id,'People',title,'atlas-reference.html#people/directory');}
  await page.evaluate(()=>{location.hash='notebook';});await labels(page,'Operations & delivery','Operations register');
  const operations=await page.evaluate(()=>AtlasOperationsNavigation.workstreams()),operation=operations.find(w=>/Procurement/i.test(w.title))||operations[0];
  for(const [id,title] of [[operation.id,operation.title],['prizes','Prizes & recognition']]){await page.evaluate(id=>{location.hash='notebook/'+encodeURIComponent(id);},id);await check(page,width,'atlas-reference.html#notebook/'+id,'Operations register',title,'atlas-reference.html#notebook');}
  await page.evaluate(()=>{location.hash='web';});await labels(page,'Operations & delivery','Website content');const webAreas=await page.evaluate(()=>AtlasOperationsNavigation.webAreas());
  for(const area of webAreas){await page.evaluate(id=>{location.hash='web/'+encodeURIComponent(id);},area.id);await check(page,width,'atlas-reference.html#web/'+encodeURIComponent(area.id),'Website content',area.title,'atlas-reference.html#web');}
  await page.reload();await labels(page,'Website content',webAreas.at(-1).title);await closed(page);await page.locator('#atlas-current-section').click();await labels(page,'Operations & delivery','Website content');await page.goBack();await labels(page,'Website content',webAreas.at(-1).title);await page.goForward();await labels(page,'Operations & delivery','Website content');
  results.history.push({width,type:'Website parent breadcrumb, reload, Back and Forward',passed:true});
  await arrive(page,'workspace.html?workstream='+encodeURIComponent(ws.id));await labels(page,ws.title,'Lists');
  await arrive(page,'index.html#workspace');await page.waitForURL(base+'/workspace.html');await labels(page,'Planning workspace','Overview');
  console.log('PASS',engine,width,'all main pages, nested routes, disclosures, keyboard/tap, snapshots, themes and history');
  await context.close();
 }
 assert.deepEqual(results.pageErrors,[]);
 }finally{await browser.close();}
 console.log('PASS',engine,results.routes.length,'route/header checks;',results.accessibility.length,'accessibility states;',results.history.length,'history groups');
})().catch(error=>{results.failure=error.message;console.error(error);process.exitCode=1;}).finally(()=>fs.writeFileSync(path.join(folder,engine+'-header-results.json'),JSON.stringify(results,null,2)));
