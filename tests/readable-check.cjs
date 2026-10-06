/* Isolated browser fixtures only. Never run write checks on production. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const base=process.env.ATLAS_URL||'http://127.0.0.1:8765';
const baseline=process.env.ATLAS_BASELINE_URL||'http://127.0.0.1:8766';
if(![base,baseline].every(url=>['localhost','127.0.0.1'].includes(new URL(url).hostname)))throw Error('This fixture suite only runs on localhost.');
const results=[], clone=x=>JSON.parse(JSON.stringify(x));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const pass=(name,evidence)=>{results.push({name,evidence});console.log('PASS',name,evidence||'');};
const views=['direction','outcomes','notebook','people','web','transport','open','exec','story','baseline','mobilize','refs'];
async function snapshot(p){return p.evaluate(()=>window.AtlasSave.snapshot());}
async function context(browser,records={},width=1440){
 const c=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
 await c.addInitScript(records=>{if(!localStorage.getItem("__atlas_fixture_installed")){for(const [key,value] of Object.entries(records))localStorage.setItem(key,value);localStorage.setItem("__atlas_fixture_installed","1");}},records);
 await c.route('**/*',r=>!['GET','HEAD'].includes(r.request().method())?r.abort():r.continue());
 return c;
}
const mockSdk=`
const listeners=[];
const user=verified=>({uid:'fixture-editor',email:'editor@example.test',emailVerified:verified,getIdToken:async()=> 'fixture-token',reload:async()=>{}});
const auth={currentUser:null,authStateReady:async()=>{}};
export const getAuth=()=>auth;
export class GoogleAuthProvider{};
const emit=()=>listeners.forEach(fn=>fn(auth.currentUser));
export const onIdTokenChanged=(a,fn)=>{listeners.push(fn);fn(a.currentUser);return()=>{};};
export async function signInWithPopup(a){a.currentUser=user(true);emit();}
export async function signInWithEmailAndPassword(a,e,p){if(p!=='correct-pass')throw {code:'auth/invalid-credential'};a.currentUser=user(true);emit();}
export async function createUserWithEmailAndPassword(a){a.currentUser=user(false);emit();}
export async function sendEmailVerification(){window.__fixtureVerificationSent=true;}
export async function sendPasswordResetEmail(){window.__fixtureResetSent=true;}
export async function reload(a){a.emailVerified=true;}
export async function signOut(a){a.currentUser=null;emit();}
`;
async function shared(browser,body,endpoint,records={}){
 const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await c.addInitScript(records=>{if(!localStorage.getItem("__atlas_fixture_installed")){for(const [key,value] of Object.entries(records))localStorage.setItem(key,value);localStorage.setItem("__atlas_fixture_installed","1");}},records);
 let document=clone(body),revision=7,puts=[],conflict=false,offline=false;
 await c.route('**/*',async r=>{
  const url=new URL(r.request().url()),method=r.request().method();
  if(url.hostname==='www.gstatic.com'&&url.pathname.endsWith('firebase-app.js'))return r.fulfill({contentType:'text/javascript',body:'export const initializeApp=()=>({});'});
  if(url.hostname==='www.gstatic.com'&&url.pathname.endsWith('firebase-auth.js'))return r.fulfill({contentType:'text/javascript',body:mockSdk});
  if(url.pathname==='/api/team-config')return r.fulfill({json:{enabled:true,provider:'firebase',verifiedEditors:true,firebase:{apiKey:'fixture',authDomain:'fixture.invalid',projectId:'fixture',appId:'fixture'}}});
  if(url.pathname==='/api/team-activity')return r.fulfill({json:{events:[],lastSave:null}});
  if(url.pathname===endpoint){
   if(method==='GET')return r.fulfill({json:{body:clone(document),revision,actor:{id:'firebase:fixture-editor',email:'editor@example.test',editor:true,manager:false,readOnly:false}}});
   if(method==='PUT'){
    if(offline)return r.abort('internetdisconnected');
    const payload=r.request().postDataJSON();puts.push(payload);
    if(conflict||payload.revision!==revision)return r.fulfill({status:409,json:{error:'The shared plan changed. Export your draft, then reload.'}});
    if(JSON.stringify(payload.plan)!==JSON.stringify(document)){document=clone(payload.plan);revision++;}return r.fulfill({json:{revision}});
   }
  }
  if(!['GET','HEAD'].includes(method))throw Error('Unexpected outbound mutation '+url);
  return r.continue();
 });
 return {c,puts,get document(){return document;},conflict:()=>{conflict=true;},offline:()=>{offline=true;},online:()=>{offline=false;}};
}
(async()=>{
 const b=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
 try{
  // Prepare fixtures exclusively from the unchanged local code in fresh storage.
  const bc=await context(b),bp=await bc.newPage();await bp.goto(baseline+'/workspace.html');
  await bp.locator('[data-action="delivery"][data-mode="progress"]').first().click();
  const command=await snapshot(bp);command.data.fixtureExtension={notes:'Retain unknown extension',attachment:{id:'attachment-fixture',url:'https://example.test/file'}};
  command.data.workstreams[0].lists[0].items[0].notes='Fixture notes: keep exactly';
  command.data.workstreams[0].lists[0].items[0].attachments=[{id:'fixture-attachment',url:'https://example.test/attachment',name:'Fixture attachment'}];
  await bp.goto(baseline+'/atlas-reference.html#notebook');
  for(const view of views)await bp.evaluate(v=>showView(v),view);
  const operations=await snapshot(bp);operations.data.plans.ws01.fixtureExtension={status:'proposed',notes:'Retain operation notes'};
  const records=await bp.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
  records['intellibus-love-speed-universe-v1']=JSON.stringify(command.data);
  records['atlas-workbook-v1']=JSON.stringify(operations.data.plans);
  await bc.close();
  const compared=[];
  for(const origin of [baseline,base]){
   const c=await context(b,records),p=await c.newPage();
   await p.goto(origin+'/workspace.html');
   for(const mode of ['progress','owners','recruitment','dependencies','decisions','publication']){await p.evaluate(mode=>window.AtlasReview.open(mode),mode);}
   const plan=await snapshot(p);
   await p.goto(origin+'/atlas-reference.html#notebook');
   for(const view of views)await p.evaluate(v=>showView(v),view);
   for(const mode of ['stakeholders','map','schools','directory']){await p.evaluate(()=>showView('people'));const button=p.locator(`[data-pmode="${mode}"]`);if(await button.count())await p.evaluate(mode=>document.querySelector(`[data-pmode="${mode}"]`).click(),mode);}
   const ops=await snapshot(p);compared.push({plan,ops});await c.close();
  }
  assert.deepEqual(compared[1],compared[0]);
  assert.deepEqual(compared[1].plan.data.fixtureExtension,command.data.fixtureExtension);
  assert.deepEqual(compared[1].plan.data.workstreams[0].lists[0].items[0].attachments,command.data.workstreams[0].lists[0].items[0].attachments);
  pass('Before/after complete record snapshots match',{commandHash:hash(compared[1].plan),operationsHash:hash(compared[1].ops),workstreams:compared[1].plan.data.workstreams.length,operationsPlans:Object.keys(compared[1].ops.data.plans).length});
  // Routes, repeated/interrupted editing and personal persistence.
  const c=await context(b,records),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/workspace.html');await p.locator('.stream-title').first().click();const workUrl=p.url();
  await p.locator('#listRows [data-action="open-list"]').first().click();const listUrl=p.url();
  await p.goBack();assert.equal(p.url(),workUrl);await p.goForward();assert.equal(p.url(),listUrl);await p.reload();assert(await p.locator('#itemRows').isVisible());
  const initial=await snapshot(p);await p.locator('[data-action="show-add-item"]').click();await p.locator('#addItem input').fill('Cancelled fixture');await p.locator('[data-action="cancel-add"]').click();assert.deepEqual(await snapshot(p),initial);
  const more=p.locator('.item-row details').first();await more.locator('summary').click();const note=more.locator('[data-item-notes]');const id=await note.getAttribute('data-item-notes');await note.fill('Local fixture saved');await p.locator('#save-now').click();await p.reload();
  const saved=await snapshot(p);const savedItem=saved.data.workstreams.flatMap(w=>w.lists.flatMap(l=>l.items)).find(i=>i.id===id);assert.equal(savedItem.notes,'Local fixture saved');
  assert.deepEqual(saved.data.fixtureExtension,command.data.fixtureExtension);pass('Personal save/reload, add/cancel, Back/Forward and list deep links');
  await p.goto(base+'/workspace.html');await p.locator('summary').filter({hasText:'Save or move this plan'}).click();
  const downloadEvent=p.waitForEvent('download');await p.locator('[data-action="export"]').click();const download=await downloadEvent;
  assert.deepEqual(JSON.parse(fs.readFileSync(await download.path(),'utf8')),(await snapshot(p)).data,'Export must contain the complete saved plan');
  const beforeImport=await snapshot(p);p.once('dialog',d=>d.dismiss());
  await p.locator('#importFile').setInputFiles({name:'isolated-fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(command.data))});
  await p.waitForTimeout(300);assert.deepEqual(await snapshot(p),beforeImport);pass('Complete backup export and cancelled personal import preserve records');
  await p.goto(base+'/atlas-reference.html#people');await p.locator('#peopleSearch').fill('Edouard');assert.equal(await p.locator('.person-card').count(),1);
  const activeContrast=await p.locator('.people-metric.on').evaluate(button=>{
   const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
   const bg=luminance(getComputedStyle(button).backgroundColor),fg=luminance(getComputedStyle(button.querySelector('b')).color);return (Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05);
  });assert(activeContrast>=4.5,'Selected People filter count must have readable text contrast');
  const profile=p.locator('[data-profile]').first();await profile.click();assert(await p.locator('#personDialog').evaluate(d=>d.open));await p.keyboard.press('Escape');assert.equal(await p.locator('#personDialog').evaluate(d=>d.open),false);
  await profile.click();await p.locator('#personDialog form[method="dialog"] button').click();assert.equal(await p.locator('#personDialog').evaluate(d=>d.open),false);
  await p.locator('#peopleSearch').fill('');await p.locator('[data-people-page="1"]').click();assert.match(await p.locator('#peopleResultCount').innerText(),/9–16/);
  for(const view of views){await p.goto(base+'/atlas-reference.html#'+view);assert.equal(await p.locator('body').getAttribute('data-section'),view);}
  await p.goto(base+'/atlas-reference.html#people');if(!await p.locator('#atlas-sidebar a[href="atlas-reference.html#notebook"]').isVisible())await p.locator('#atlas-sidebar details[data-group="operations"] > summary').click();await p.locator('#atlas-sidebar a[href="atlas-reference.html#notebook"]').click();await p.locator('#atlas-sidebar a[href="atlas-reference.html#outcomes"]').click();await p.goBack();assert.equal(await p.locator('body').getAttribute('data-section'),'notebook');await p.goForward();assert.equal(await p.locator('body').getAttribute('data-section'),'outcomes');
  pass('All twelve operations deep links, directory search/pagination, profile Close/Escape, operations Back/Forward');
  await p.goto(base+'/atlas-reference.html#transport');await p.locator('#map-category').selectOption('highschool');await p.locator('#map-search').fill('Montego');await p.locator('#map-open-planning').click();assert(await p.locator('#map-planning-dialog').evaluate(d=>d.open));await p.keyboard.press('Escape');assert.equal(await p.locator('#map-planning-dialog').evaluate(d=>d.open),false);pass('Transport filters and full planning dialog in unavailable-map state');
  await p.goto(base+'/virtual-walkthrough.html');const frame=p.frameLocator('iframe');await frame.locator('#scene option').nth(1).waitFor({state:'attached'});await p.locator('iframe').scrollIntoViewIfNeeded();const old=await frame.locator('#scene').inputValue();await frame.locator('#next').click();assert.notEqual(await frame.locator('#scene').inputValue(),old);await p.locator('#venue-mode').click();assert.equal(await p.locator('#journey-venue').getAttribute('data-tour-mode'),'scroll');await p.locator('#venue-mode').click();assert.equal(await p.locator('#journey-venue').getAttribute('data-tour-mode'),'manual');pass('Venue viewpoints and retained scroll-tour mode');
  assert.deepEqual(errors,[]);await c.close();
  // Auth UI and cloud queue use mock SDK + documents. No account/email/database mutation.
  for(const endpoint of ['/api/team-plan','/api/team-operations']){
   const isPlan=endpoint.endsWith('team-plan'),sharedBody=clone(isPlan?command.data:operations.data),mock=await shared(b,sharedBody,endpoint,records),page=await mock.c.newPage();
   await page.goto(base+(isPlan?'/workspace.html':'/atlas-reference.html#notebook'));
   await page.locator('#atlas-account-control').click();await page.locator('.atlas-login').waitFor({state:'visible'});await page.locator('.atlas-login [aria-label="Close sign-in"]').click();assert.equal(mock.puts.length,0);
   await page.locator('#atlas-account-control').click();await page.locator('.atlas-login [name=email]').fill('editor@example.test');await page.locator('.atlas-login [name=password]').fill('bad-pass');await page.locator('.atlas-login button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('[data-auth-status]').textContent.includes('did not complete'));assert.equal(mock.puts.length,0);
   if(isPlan)await page.locator('.atlas-login [data-google]').click();
   else{await page.locator('.atlas-login [name=password]').fill('correct-pass');await page.locator('.atlas-login button[type=submit]').click();}
   await page.waitForFunction(()=>window.AtlasTeam.active);assert.equal(mock.puts.length,0,'Sign-in must not upload personal drafts');
   if(isPlan){await page.locator('.numbers-panel summary').click();await page.locator('[data-metric-current="registrations"]').fill('123');await page.locator('#save-now').click();}
   else{await page.locator('#panel textarea').first().fill('Mock operations note');await page.locator('#save-now').click();}
   await page.waitForFunction(()=>document.querySelector('#team-bar').textContent.includes('Saved to cloud'));assert(mock.puts.length>=1);assert.equal(mock.puts[0].revision,7);
   if(isPlan){assert.equal(mock.document.command.metrics.find(m=>m.id==='registrations').current,123);assert.deepEqual(mock.document.fixtureExtension,command.data.fixtureExtension);}
   else assert.deepEqual(mock.document.plans.ws01.fixtureExtension,operations.data.plans.ws01.fixtureExtension);
   const count=mock.puts.length;await page.locator('#save-now').click();await page.waitForTimeout(500);assert.deepEqual(mock.document,clone(mock.puts[count-1].plan),'No-op save must not change content');
   const beforeOffline=clone(mock.document);mock.offline();
   if(isPlan)await page.locator('[data-metric-current="registrations"]').fill('125');else await page.locator('#panel textarea').first().fill('Offline fixture');
   await page.locator('#save-now').click();await page.waitForFunction(()=>/unavailable|retrying/i.test(document.querySelector('#team-bar').textContent));assert.deepEqual(mock.document,beforeOffline);
   assert(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('atlas-cloud-pending-'))),'An offline draft must remain recoverable');
   mock.online();await page.locator('#save-now').click();await page.waitForFunction(()=>document.querySelector('#team-bar').textContent.includes('Saved to cloud'));
   mock.conflict();if(isPlan)await page.locator('[data-metric-current="registrations"]').fill('124');else await page.locator('#panel textarea').first().fill('Conflict fixture');await page.locator('#save-now').click();await page.waitForFunction(()=>/changed|conflict/i.test(document.querySelector('#team-bar').textContent));const attempted=mock.puts.length;await page.waitForTimeout(1200);assert.equal(mock.puts.length,attempted,'Conflict must stop retries');assert.equal(mock.puts.at(-1).revision,9);
   page.once('dialog',d=>d.dismiss());await page.locator('#atlas-account-control').click();await page.locator('#account-logout').click();assert(await page.evaluate(()=>window.AtlasTeam.active),'Cancel sign-out must retain shared draft');
   pass('Mock verified sign-in, save, no-op, offline retry, conflict recovery and cancelled sign-out '+endpoint,{putCount:mock.puts.length,protectedRevision:9});
   await mock.c.close();
  }
  fs.writeFileSync(process.env.ATLAS_EVIDENCE||path.join(process.cwd(),'readable-verification.json'),JSON.stringify({results,productionMutations:0},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
