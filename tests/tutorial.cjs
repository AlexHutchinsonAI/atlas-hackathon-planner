/* Exercise every tour, including mobile positioning, skip/restart and screen transitions. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.ATLAS_TEST_URL||'http://127.0.0.1:8768';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const errors=[];
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/index.html');
  const tour=page.locator('#atlas-tutorial');
  await tour.locator('#launch').click();
  await tour.getByRole('button',{name:'Skip tutorial',exact:true}).click();
  await page.reload();await page.waitForTimeout(850);assert(await tour.locator('#panel').isHidden());
  const routes=['index.html','workspace.html','atlas-reference.html#direction','atlas-reference.html#outcomes','atlas-reference.html#notebook','atlas-reference.html#people','atlas-reference.html#web','atlas-reference.html#transport','atlas-reference.html#open','virtual-walkthrough.html','venue/index.html'];
  for(const route of routes){
   await page.goto(base+'/'+route,{waitUntil:'domcontentloaded'});await tour.locator('#launch').click();
   let count=0;
   while(await tour.locator('#panel').isVisible()){
    await page.waitForTimeout(180);
    const bounds=await tour.locator('#panel').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width+1,route+' card overflows width');assert(bounds.y>=0&&bounds.y+bounds.height<=901,route+' card overflows height');
    const name=await tour.locator('#title').textContent();
    // All steps must point to a real visible control or region, not silently lose their target.
    assert(await tour.locator('#ring').isVisible(),route+' missing highlight: '+name);
    if(count===1){await tour.locator('#back').click();await tour.locator('#next').click();}
    await tour.locator('#next').click();if(++count>16)throw Error('Tour did not finish');
   }
   console.log('PASS',width,route,count,'steps');
  }
  await page.goto(base+'/workspace.html');await page.locator('.stream-title').first().click();await tour.locator('#launch').click();await page.waitForTimeout(200);assert.match(await tour.locator('#title').textContent(),/workstream/);
  await tour.locator('#skip').click();await page.locator('#listRows [data-action="open-list"]').first().click();await tour.locator('#launch').click();await page.waitForTimeout(200);assert.match(await tour.locator('#title').textContent(),/list/);await page.keyboard.press('Escape');assert(await tour.locator('#panel').isHidden());
  for(const mode of ['progress','owners','recruitment','dependencies','decisions','publication']){
   await page.goto(base+'/workspace.html',{waitUntil:'domcontentloaded'});
   const button=page.locator('#atlas-sidebar a[href="workspace.html#review/'+mode+'"]');
   if(!await page.locator('#atlas-sidebar').isVisible())await page.locator('#atlas-menu-toggle').click();
   await button.evaluate(el=>{for(let node=el.parentElement;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;});
   await button.click();await tour.locator('#launch').click();
   while(await tour.locator('#panel').isVisible()){await page.waitForTimeout(150);assert(await tour.locator('#ring').isVisible(),'review '+mode+' missing target');await tour.locator('#next').click();}
   console.log('PASS',width,'delivery',mode);
  }
  await page.goto(base+'/atlas-reference.html#transport',{waitUntil:'domcontentloaded'});
  await tour.locator('#launch').click();for(let i=0;i<6;i++)await tour.locator('#next').click();await page.locator('#map-open-planning').click();
  await page.waitForTimeout(450);assert.match(await tour.locator('#title').textContent(),/Transport planning/);
  while(await tour.locator('#panel').isVisible()){await tour.locator('#next').click();}
  await page.locator('.map-dialog-head button').click();await tour.locator('#launch').click();await page.keyboard.press('Escape');
  console.log('PASS',width,'native dialog help and focus');
  await context.close();
 }
 await browser.close();assert.deepEqual(errors,[]);console.log('PASS no JavaScript errors');
})().catch(e=>{console.error(e);process.exit(1)});
