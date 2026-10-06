/* Confirmed user regression: album Open must enter the selected area, not open the menu. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.ATLAS_URL||'http://127.0.0.1:8765';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Isolated local preview only.');
const destinations=[
 ['Planning workspace','workspace.html','.workspace-heading'],
 ['People directory','atlas-reference.html#people/directory','#peopleSearch'],
 ['Operations register','atlas-reference.html#notebook','[aria-label="Selected operations workstream"]'],
 ['Transport planning','atlas-reference.html#transport','#map-category'],
 ['Venue walkthrough','virtual-walkthrough.html','.venue-window iframe'],
 ['Atlas Tech assistant','assistant.html','.open-bot'],
];
const results=[],evidence=process.env.ATLAS_EVIDENCE||'/tmp/atlas-album-verification.json';
async function selectedSnapshot(p){return p.evaluate(()=>AtlasSave.snapshot());}
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 for(const width of [1440,390,320]){
  const c=await b.newContext({viewport:{width,height:1000}});
  await c.route('**/*',r=>!['GET','HEAD'].includes(r.request().method())?r.abort():r.continue());
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/');await p.locator('#album-open-menu').click();assert.equal(new URL(p.url()).pathname,'/workspace.html');await p.goBack();assert(await p.locator('.album-stage').isVisible());
  for(let i=0;i<destinations.length;i++){
   const [name,url,selector]=destinations[i];
   await p.goto(base+'/index.html');const before=await selectedSnapshot(p);
   await p.locator('[data-album="'+i+'"]').click();
   assert.equal(await p.locator('#album-name').innerText(),name);
   assert.equal(await p.locator('#album-open-menu').getAttribute('href'),url);
   assert.equal(await p.locator('#album-open-menu').innerText(),'Open '+name+' →');
   assert.deepEqual(await selectedSnapshot(p),before,'Album selection must leave every planning field unchanged');
   if(i===4&&width!==320){await p.waitForTimeout(350);await p.evaluate(()=>{document.activeElement.blur();scrollTo(0,0);});await p.screenshot({path:path.join(path.dirname(evidence),width+'-album-open.png'),fullPage:true});}
   await p.locator('#album-open-menu').focus();await p.keyboard.press('Enter');await p.waitForURL(base+'/'+url);
   assert.equal(p.url(),base+'/'+url);
   await p.locator(selector).waitFor({state:'visible'});
   assert(await p.locator(selector).isVisible(),name+' must display its working area');
   await p.goBack();assert.equal(new URL(p.url()).pathname,'/index.html');assert.equal(await p.locator('[data-album]').count(),6);
   await p.goForward();await p.waitForURL(base+'/'+url);await p.locator(selector).waitFor({state:'visible'});assert.equal(p.url(),base+'/'+url);assert(await p.locator(selector).isVisible());
   results.push({width,name,destination:url,passed:true});console.log('PASS',width,name,'Open, keyboard, Back/Forward and snapshot equality');
  }
  await p.goto(base+'/index.html');await p.locator('[data-album="1"]').focus();await p.keyboard.press('Enter');assert.match(await p.locator('#album-open-menu').innerText(),/People directory/);
  await p.locator('[data-album="5"]').click();const open=p.locator('#album-open-menu');const newTab=c.waitForEvent('page');await open.click({button:'middle'});const tab=await newTab;await tab.waitForLoadState('domcontentloaded');assert.equal(new URL(tab.url()).pathname,'/assistant.html');await tab.close();
  assert(await p.locator('.album-stage').isVisible());assert.deepEqual(errors,[]);await c.close();
 }
}finally{await b.close();fs.writeFileSync(evidence,JSON.stringify({results,productionRecordMutations:0},null,2));}
console.log('PASS',results.length,'album destinations plus default Open and native new-tab navigation');
})().catch(e=>{console.error(e);process.exit(1)});
