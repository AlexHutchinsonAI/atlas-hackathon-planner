/* Regression: expanded transport planning must never inherit the narrow map sidebar. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.stack));
 const base=process.env.ATLAS_TEST_URL||'http://127.0.0.1:8768';
 if(base.includes('127.0.0.1'))await page.route('**/api/map-config',async route=>{
   const response=await page.request.get('https://atlas-hackathon-planner.vercel.app/api/map-config');
   await route.fulfill({response});
 });
 try {
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:900});
   await page.goto(base+'/atlas-reference.html#transport');
   await page.waitForSelector('.mapboxgl-canvas');
   await page.locator('#map-category').selectOption('university');
   await page.locator('#map-search').fill('xyz-no-match');
   assert.match(await page.locator('#map-pickups').innerText(),/No matching/);
   await page.locator('#map-search').fill('');
   assert.ok(await page.locator('.map-pickup').count()>0);
   for(const style of ['satellite','dark','streets'])await page.locator('#map-style').selectOption(style);
   await page.locator('#map-venue').click();
   await page.waitForSelector('.mapboxgl-popup');
   await page.locator('.mapboxgl-popup-close-button').click();
   if(!await page.locator('.map-controls').evaluate(e=>e.open))await page.locator('.map-controls > summary').click();
   await page.locator('#map-open-planning').click();
   assert.equal(await page.locator('#map-planning-dialog').evaluate(e=>e.open),true);
   assert.equal(await page.locator('#map-planning-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'dialog horizontal overflow at '+width);
   const cards=await page.locator('#map-planning-dialog .person-card').evaluateAll(es=>es.map(e=>({w:e.clientWidth,scroll:e.scrollWidth})));
   assert.ok(cards.every(c=>c.scroll<=c.w+1),'ownership cards overflow at '+width);
   for(const detail of await page.locator('#map-planning > details').all()){
     await detail.locator('summary').first().click();
     assert.equal(await detail.evaluate(e=>e.open),true);
   }
   await page.locator('#map-planning-dialog .transport-hero').scrollIntoViewIfNeeded();
   await page.screenshot({path:'/tmp/transport-fixed-'+width+'.png'});
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#map-planning-dialog').evaluate(e=>e.open),false);
   await page.locator('.map-controls > summary').click();
   assert.equal(await page.locator('.map-controls').evaluate(e=>e.open),false);
   await page.locator('.map-controls > summary').click();
   await page.locator('[data-view="people"]').click();
   assert.equal(await page.locator('.mapboxgl-canvas').count(),0);
   await page.locator('[data-view="transport"]').click();
   await page.waitForSelector('.mapboxgl-canvas');
   await page.waitForTimeout(500);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'page overflow at '+width);
   console.log('PASS transport interactions and expanded layout at '+width+'px');
  }
  assert.deepEqual(errors,[]);console.log('PASS no page errors');
 } finally {if(errors.length)console.log(errors);await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
