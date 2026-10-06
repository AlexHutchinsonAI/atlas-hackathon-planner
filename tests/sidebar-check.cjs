/* Isolated local navigation/account checks. Shared endpoints and all writes are mocked or blocked. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.ATLAS_URL||'http://127.0.0.1:8765';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Local preview only.');
const results=[];const pass=(name,extra={})=>{results.push({name,...extra});console.log('PASS',name);};
async function clickLink(p,href){
 if(!await p.locator('#atlas-sidebar').isVisible())await p.locator('#atlas-menu-toggle').click();
 const link=p.locator('#atlas-sidebar a[href="'+href+'"]').first();
 await link.evaluate(el=>{for(let node=el.parentElement;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;});
 await link.click();await p.waitForTimeout(100);
}
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 for(const width of [1440,390]){
  const c=await b.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await c.route('**/*',r=>!['GET','HEAD'].includes(r.request().method())?r.abort():r.continue());const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  for(const page of ['index.html','workspace.html','atlas-reference.html#direction','assistant.html','virtual-walkthrough.html','venue/index.html']){
   await p.goto(base+'/'+page);await p.waitForTimeout(100);assert.equal(await p.locator('#atlas-sidebar').count(),1);
   const initial=await p.locator('#atlas-sidebar').isVisible();await p.locator('#atlas-menu-toggle').click();assert.equal(await p.locator('#atlas-sidebar').isVisible(),!initial);if(initial)await p.locator('#atlas-menu-toggle').click();
   if(width===390){assert.equal(await p.locator('#atlas-sidebar').getAttribute('aria-modal'),'true');assert(await p.locator('#atlas-toolbar').evaluate(e=>e.inert));await p.locator('#atlas-menu-close').focus();await p.keyboard.press('Shift+Tab');assert(await p.locator('#atlas-sidebar').evaluate(e=>e.contains(document.activeElement)));await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'atlas-menu-close');}
   await p.keyboard.press('Escape');assert.equal(await p.locator('#atlas-sidebar').isVisible(),false);assert.equal(await p.evaluate(()=>document.activeElement.id),'atlas-menu-toggle');assert.equal(await p.locator('#atlas-toolbar').evaluate(e=>e.inert),false);
  }
  pass('Universal sidebar toggle, focus, Escape and mobile inert/focus containment '+width);
  await p.goto(base+'/workspace.html');for(const view of ['progress','owners','recruitment','dependencies','decisions','publication']){await clickLink(p,'workspace.html#review/'+view);assert.equal(await p.evaluate(()=>AtlasReview.currentTab()),view);assert.equal(await p.locator('#atlas-sidebar a[aria-current="page"]').getAttribute('href'),'workspace.html#review/'+view);}
  await p.goBack();assert.equal(await p.evaluate(()=>AtlasReview.currentTab()),'decisions');await p.goForward();assert.equal(await p.evaluate(()=>AtlasReview.currentTab()),'publication');
  await clickLink(p,'workspace.html#workstream/ws01/list');for(const mode of ['organize','validate','execute','list']){await clickLink(p,'workspace.html#workstream/ws01/'+mode);assert.equal(await p.evaluate(()=>AtlasPlannerNavigation.context().mode),mode);}
  await clickLink(p,'workspace.html#list/ws01/ws01-work');assert(await p.locator('#itemRows').isVisible());await p.reload();assert(await p.locator('#itemRows').isVisible());
  pass('All six review routes, all four workstream modes, list deep link/reload and Back/Forward '+width);
  await p.goto(base+'/atlas-reference.html#notebook');const procurement=await p.evaluate(()=>AtlasOperationsNavigation.workstreams().find(w=>/Procurement/i.test(w.title)));assert(procurement);await clickLink(p,'atlas-reference.html#notebook/'+procurement.id);assert.match(await p.locator('#panel h2').first().innerText(),/Procurement/);await p.reload();assert.match(await p.locator('#panel h2').first().innerText(),/Procurement/);
  for(const mode of ['directory','stakeholders','map','schools']){await clickLink(p,'atlas-reference.html#people/'+mode);assert.equal(await p.locator('[data-pmode="'+mode+'"]').getAttribute('aria-pressed'),'true');}
  await p.goto(base+'/atlas-reference.html#web');const areas=await p.evaluate(()=>AtlasOperationsNavigation.webAreas());for(const area of areas){await clickLink(p,'atlas-reference.html#web/'+encodeURIComponent(area.id));assert.equal(await p.locator('#atlas-sidebar a[aria-current="page"]').getAttribute('href'),'atlas-reference.html#web/'+encodeURIComponent(area.id));}
  pass('Procurement/reload, four People deep links and every website content area '+width,{websiteAreas:areas.length});
  assert.deepEqual(errors,[]);await c.close();
 }
 // The informational pages use the existing Firebase UI with no planning-document GET or write.
 const source=fs.readFileSync('tests/readable-check.cjs','utf8'),sdk=source.split('const mockSdk=`')[1].split('\n`;')[0];
 for(const width of [1440,390])for(const route of ['assistant.html','virtual-walkthrough.html','venue/index.html']){
  const c=await b.newContext({viewport:{width,height:1000}}),requests=[];
  await c.route('**/*',async r=>{const u=new URL(r.request().url()),method=r.request().method();
   if(u.pathname==='/api/team-config')return r.fulfill({json:{enabled:true,provider:'firebase',verifiedEditors:true,firebase:{apiKey:'fixture',authDomain:'fixture.invalid',projectId:'fixture',appId:'fixture'}}});
   if(u.hostname==='www.gstatic.com'&&u.pathname.endsWith('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:'export const initializeApp=()=>({});'});
   if(u.hostname==='www.gstatic.com'&&u.pathname.endsWith('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:sdk});
   if(/^\/api\/team-(plan|operations|activity)$/.test(u.pathname)){requests.push({method,path:u.pathname});return r.abort();}
   if(!['GET','HEAD'].includes(method))return r.abort();return r.continue();
  });
  const p=await c.newPage();await p.goto(base+'/'+route);await p.locator('#atlas-account-control').click();await p.locator('.atlas-login [data-google]').click();await p.waitForFunction(()=>AtlasPageAccount.current.active);await p.locator('#atlas-account-control').click();assert(await p.locator('#atlas-account-settings').evaluate(d=>d.open));assert.match(await p.locator('#account-current-info').innerText(),/editor@example.test/);if(route==='assistant.html')await p.screenshot({path:'../evidence/sidebar/'+width+'-account-settings-mocked.png'});await p.locator('#account-appearance').click();assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');await p.locator('#account-logout').click();await p.waitForFunction(()=>!AtlasPageAccount.current.active);assert.deepEqual(requests,[]);await c.close();pass('Mock sign-in, current-account panel, appearance and sign-out '+width+' '+route,{sharedRequests:0});
 }
 fs.writeFileSync(process.env.ATLAS_EVIDENCE||'sidebar-verification.json',JSON.stringify({results,productionMutations:0},null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
