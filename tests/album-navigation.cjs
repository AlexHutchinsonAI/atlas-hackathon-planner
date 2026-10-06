/* Local regression checks for direct cover links and the selected album's Open link. */
const playwright = require('playwright');
const assert = require('node:assert/strict'), fs = require('node:fs');
const base = process.env.ATLAS_URL || 'http://127.0.0.1:8765';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw Error('Isolated local preview only.');
const engine = process.env.ATLAS_BROWSER || 'chromium';
const destinations = [
  ['Planning workspace', 'workspace.html', '.workspace-heading'],
  ['People directory', 'atlas-reference.html#people/directory', '#peopleSearch'],
  ['Operations register', 'atlas-reference.html#notebook', '[aria-label="Selected operations workstream"]'],
  ['Transport planning', 'atlas-reference.html#transport', '#map-category'],
  ['Venue walkthrough', 'virtual-walkthrough.html', '.venue-window iframe'],
  ['Atlas Tech assistant', 'assistant.html', '.open-bot']
];
const results = [], evidence = process.env.ATLAS_EVIDENCE || '/tmp/atlas-album-verification.json';
async function home(page) {
  await page.goto(base + '/index.html');
  await page.locator('.album-stage[data-ready="true"]').waitFor();
}
async function preview(page, index) {
  await page.locator('[data-album-select="' + index + '"]').click();
  await page.waitForFunction(index => {
    const stage = document.querySelector('.album-stage'), cover = stage.querySelector('[data-album="' + index + '"]');
    return cover.dataset.selected === 'true' && Math.abs(cover.offsetLeft + cover.offsetWidth / 2 - stage.scrollLeft - stage.clientWidth / 2) < 4;
  }, index);
}
async function destination(page, url, selector) {
  await page.waitForURL(base + '/' + url);
  await page.locator(selector).waitFor({state: 'visible'});
  assert.equal(page.url(), base + '/' + url);
}
(async () => {
  const browser = await playwright[engine].launch({headless: true, ...(engine === 'chromium' ? {channel: 'chrome'} : {})});
  try {
    for (const width of [1440, 390, 320]) {
      const context = await browser.newContext({viewport: {width, height: 1000}, hasTouch: true});
      await context.route('**/*', route => !['GET', 'HEAD'].includes(route.request().method()) ? route.abort() : route.continue());
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base + '/');
      await page.locator('#album-open-menu').click();
      await destination(page, 'workspace.html', '.workspace-heading');
      for (let index = 0; index < destinations.length; index++) {
        const [name, url, selector] = destinations[index];
        await home(page);
        const before = await page.evaluate(() => AtlasSave.snapshot());
        await preview(page, index);
        assert.equal(await page.locator('#album-name').innerText(), name);
        assert.equal(await page.locator('#album-open-menu').getAttribute('href'), url);
        assert.equal(await page.locator('[data-album="' + index + '"]').getAttribute('href'), url);
        assert.deepEqual(await page.evaluate(() => AtlasSave.snapshot()), before, 'Browsing must leave every planning field unchanged');
        await page.locator('#album-open-menu').focus();
        await page.keyboard.press('Enter');
        await destination(page, url, selector);
        await page.goBack();
        assert.equal(new URL(page.url()).pathname, '/index.html');
        await page.locator('.album-stage[data-ready="true"]').waitFor();
        await page.goForward();
        await destination(page, url, selector);
        results.push({engine, width, name, method: 'Open / Enter / Back / Forward', passed: true});
        await home(page);
        await preview(page, index);
        const cover = page.locator('[data-album="' + index + '"]');
        if (width === 390) await cover.tap();
        else if (width === 320) { await cover.focus(); await page.keyboard.press('Enter'); }
        else await cover.click();
        await destination(page, url, selector);
        await page.goBack();
        await page.locator('.album-stage[data-ready="true"]').waitFor();
        results.push({engine, width, name, method: width === 390 ? 'Cover tap' : width === 320 ? 'Cover Enter' : 'Cover click', passed: true});
        console.log('PASS', engine, width, name, 'cover opens directly; Open and history work; snapshot unchanged');
      }
      await home(page);
      await preview(page, 5);
      const newTab = context.waitForEvent('page');
      await page.locator('[data-album="5"]').click(engine === 'webkit' ? {modifiers: ['Meta']} : {button: 'middle'});
      const tab = await newTab;
      await tab.waitForLoadState('domcontentloaded');
      assert.equal(new URL(tab.url()).pathname, '/assistant.html');
      await tab.close();
      assert.equal(new URL(page.url()).pathname, '/index.html');
      assert.deepEqual(errors, []);
      await context.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(evidence, JSON.stringify({engine, results, defaultOpenAndNativeNewTabWidths: 3, productionRecordMutations: 0}, null, 2));
  }
  console.log('PASS', results.length, engine, 'destination checks plus default Open and native cover new tabs');
})().catch(error => { console.error(error); process.exit(1); });
