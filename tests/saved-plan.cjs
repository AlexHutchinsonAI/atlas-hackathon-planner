/* Verify source completeness, old-draft preservation, editing, reloads and responsive rendering. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const base=process.env.ATLAS_TEST_URL||'http://127.0.0.1:8773';
(async()=>{
 const source={window:{}};vm.runInNewContext(fs.readFileSync('data/destini-plan.js','utf8'),source);
 const exported=source.window.ATLAS_DESTINI_PLAN;
 assert.equal(exported.flatMap(p=>p.tasks).length,153);assert.equal(exported.flatMap(p=>p.results).length,117);
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/team-config',r=>r.fulfill({json:{enabled:false}}));
  await page.goto(base+'/workspace.html');await page.waitForSelector('.stream-title');
  await page.evaluate(()=>localStorage.setItem('atlas-tutorial-dismissed','true'));
  const skip=page.locator('#atlas-tutorial').getByRole('button',{name:'Skip tutorial',exact:true});if(await skip.isVisible())await skip.click();
  for(const p of exported){
   const id='ws'+String(p.n).padStart(2,'0');
   await page.locator('details.all-workstreams').evaluate(e=>e.open=true);
   await page.locator(`#homeRows [data-action="open-workstream"][data-id="${id}"]`).click();
   assert.equal(await page.locator('.saved-table tbody tr').count(),p.tasks.length);
   assert(await page.locator('.saved-plan').innerText().then(t=>t.includes(p.outcome)));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Page overflows '+id+' '+width);
   await page.goto(base+'/workspace.html');await page.waitForSelector('.stream-title');
  }
  await page.locator('details.all-workstreams').evaluate(e=>e.open=true);await page.locator('#homeRows [data-action="open-workstream"][data-id="ws05"]').click();
  const owner=page.locator('[data-saved-field="owner"]').first();assert.equal(await owner.inputValue(),'Nakia');await owner.fill('Test owner');await owner.press('Tab');
  await page.locator('[data-saved-field="done"]').first().check();
  await page.reload();await page.waitForSelector('.stream-title');await page.locator('details.all-workstreams').evaluate(e=>e.open=true);await page.locator('#homeRows [data-action="open-workstream"][data-id="ws05"]').click();
  assert.equal(await owner.inputValue(),'Test owner');assert(await page.locator('[data-saved-field="done"]').first().isChecked());
  assert.equal(await page.evaluate(()=>AtlasSave.snapshot().data.workstreams.find(w=>w.id==='ws05').lists.find(l=>l.kind==='work').items[0].owner),'');
  await page.screenshot({path:'/tmp/atlas-saved-plan-'+width+'.png',fullPage:false});assert.deepEqual(errors,[]);
  await page.goto(base+'/index.html');assert(await page.locator('#app').innerHTML().then(s=>s.length>0));
  console.log('PASS',width,'all 17 streams, edits, reload, existing data and homepage');await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
