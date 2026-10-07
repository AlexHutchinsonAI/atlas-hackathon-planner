/* Isolated fixture edits must survive breadcrumb/menu navigation without dropping other data. */
const playwright=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.ATLAS_URL||'http://127.0.0.1:8765',engine=process.env.ATLAS_BROWSER||'chromium',folder=process.env.ATLAS_EVIDENCE_DIR||'/tmp';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Local fixtures only.');
const result={engine,flows:[],productionRecordMutations:0};
const snapshot=page=>page.evaluate(()=>AtlasSave.snapshot().data);
const block=route=>!['GET','HEAD'].includes(route.request().method())?route.abort():route.continue();
(async()=>{
 const browser=await playwright[engine].launch({headless:true,...(engine==='chromium'?{channel:'chrome'}:{})});
 try{
  const seedContext=await browser.newContext();await seedContext.route('**/*',block);const seedPage=await seedContext.newPage();await seedPage.goto(base+'/workspace.html');
  const fixture=await snapshot(seedPage);await seedContext.close();
  fixture.fixtureExtension={notes:'Preserve unknown extension',attachment:{id:'fixture-attachment',url:'https://example.test/header-fixture'}};
  const ws=fixture.workstreams[0],list=ws.lists.find(list=>list.items.length),item=list.items[0];
  item.attachments=[{id:'fixture-file',name:'Keep this attachment',url:'https://example.test/file'}];item.notes='Original isolated note';
  const route='/workspace.html#list/'+encodeURIComponent(ws.id)+'/'+encodeURIComponent(list.id);
  for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await context.route('**/*',block);
   await context.addInitScript(data=>{if(!localStorage.getItem('__header_editor_fixture')){localStorage.setItem('intellibus-love-speed-universe-v1',JSON.stringify(data));localStorage.setItem('__header_editor_fixture','1');}},fixture);
   const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto(base+route);await page.locator('#itemRows').waitFor();
   if(await page.locator('#atlas-sidebar').isVisible())await page.locator('#atlas-menu-close').click();
   assert.deepEqual(await snapshot(page),fixture);
   const expected=structuredClone(fixture),expectedItem=expected.workstreams[0].lists.find(l=>l.id===list.id).items.find(i=>i.id===item.id);
   const details=page.locator('.item-row[data-id="'+item.id+'"] details');await details.locator('summary').click();await details.locator('textarea[data-item-notes]').fill('Edited before breadcrumb navigation');
   await page.locator('#atlas-current-section').click();await page.waitForFunction(()=>AtlasPlannerNavigation.context().screen==='workstream');expectedItem.notes='Edited before breadcrumb navigation';assert.deepEqual(await snapshot(page),expected);
   await page.goBack();await page.locator('#itemRows').waitFor();await page.reload();assert.deepEqual(await snapshot(page),expected);
   await page.locator('[data-action="show-add-item"]').click();await page.locator('#addItem input').fill('Cancelled fixture item');await page.locator('[data-action="cancel-add"]').click();assert.deepEqual(await snapshot(page),expected);
   await page.locator('.item-row[data-id="'+item.id+'"] details summary').click();await page.locator('[data-item-notes="'+item.id+'"]').fill('Edited before opening navigation');await page.locator('#atlas-menu-toggle').click();await page.keyboard.press('Escape');expectedItem.notes='Edited before opening navigation';assert.deepEqual(await snapshot(page),expected);
   await page.locator('#save-now').click();await page.reload();assert.deepEqual(await snapshot(page),expected);assert.deepEqual(errors,[]);
   result.flows.push({width,passed:true,checks:['note blur through parent breadcrumb','Back and reload','add/cancel','note blur through menu open/close','Save now and reload','strict complete data equality including unknown fields and attachments']});
   console.log('PASS',engine,width,'fixture edits survive breadcrumbs, menu interruption, Save now, reload and cancel');await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{result.failure=error.message;console.error(error);process.exitCode=1;}).finally(()=>fs.writeFileSync(path.join(folder,engine+'-header-editor-results.json'),JSON.stringify(result,null,2)));
