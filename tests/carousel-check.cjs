/* Isolated carousel gestures, cancellations, focus, responsive layout and record preservation. */
const playwright = require('playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const base = process.env.ATLAS_URL || 'http://127.0.0.1:8765';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw Error('Local fixture checks only.');
const engine = process.env.ATLAS_BROWSER || 'chromium';
const folder = process.env.ATLAS_EVIDENCE_DIR || '/tmp', results = [];
const pass = (width, name, detail = {}) => { results.push({engine, width, name, passed: true, ...detail}); console.log('PASS', engine, width, name); };
async function centered(page, index) {
  await page.waitForFunction(index => {
    const stage = document.querySelector('.album-stage'), cover = stage.querySelector('[data-album="' + index + '"]');
    return cover.dataset.selected === 'true' && Math.abs(cover.offsetLeft + cover.offsetWidth / 2 - stage.scrollLeft - stage.clientWidth / 2) < 4;
  }, index);
}
async function select(page, index) {
  await page.locator('[data-album-select="' + index + '"]').click();
  await centered(page, index);
}
async function snapshot(page) { return page.evaluate(() => AtlasSave.snapshot()); }
async function drag(page, distance, cancel = false) {
  await page.locator('.album-stage').scrollIntoViewIfNeeded();
  const box = await page.locator('.album-stage').boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x - distance, y, {steps: 12});
  if (cancel) await page.locator('.album-stage').evaluate(stage => stage.dispatchEvent(new PointerEvent('pointercancel', {bubbles: true, pointerId: window.__carouselPointerId, pointerType: 'mouse', isPrimary: true})));
  await page.mouse.up();
  assert.equal(new URL(page.url()).pathname, '/index.html', 'Drag/cancel must never open a cover');
  assert.equal(await page.locator('.is-dragging').count(), 0);
  assert.equal(await page.locator('.album-stage').evaluate(stage => stage.style.scrollSnapType), '');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.album), await page.locator('[data-selected="true"]').getAttribute('data-album'), 'Drag should leave keyboard focus on the centered cover');
}
async function swipe(page, session, dx, dy, cancel = false) {
  await page.locator('.album-stage').scrollIntoViewIfNeeded();
  const box = await page.locator('.album-stage').boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const point = (px, py) => [{x: px, y: py, id: 1}];
  await session.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: point(x, y)});
  for (let i = 1; i <= 10; i++) {
    await session.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: point(x + dx * i / 10, y + dy * i / 10)});
    await page.waitForTimeout(24);
  }
  await session.send('Input.dispatchTouchEvent', {type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: []});
  await page.waitForTimeout(400);
  assert.equal(new URL(page.url()).pathname, '/index.html', 'Touch browsing must never navigate');
}
(async () => {
  const browser = await playwright[engine].launch({headless: true, ...(engine === 'chromium' ? {channel: 'chrome'} : {})});
  try {
    for (const width of [1440, 390, 320]) {
      const context = await browser.newContext({viewport: {width, height: 1000}, hasTouch: true});
      await context.route('**/*', route => !['GET', 'HEAD'].includes(route.request().method()) ? route.abort() : route.continue());
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base + '/index.html'); await page.locator('.album-stage[data-ready="true"]').waitFor();
      await page.locator('.album-stage').evaluate(stage => stage.addEventListener('pointerdown', event => { window.__carouselPointerId = event.pointerId; }));
      const before = await snapshot(page);
      await page.locator('.album-stage').focus();
      await page.keyboard.press('End'); await centered(page, 5);
      assert(await page.locator('[data-album-step="1"]').isDisabled());
      await page.keyboard.press('Home'); await centered(page, 0);
      assert(await page.locator('[data-album-step="-1"]').isDisabled());
      await page.keyboard.press('ArrowRight'); await centered(page, 1);
      await page.locator('[data-album="1"]').focus(); await page.keyboard.press('ArrowRight'); await centered(page, 2);
      assert.equal(await page.evaluate(() => document.activeElement.dataset.album), '2');
      await select(page, 0);
      for (let i = 0; i < 3; i++) await page.locator('[data-album-step="1"]').click();
      await centered(page, 3);
      pass(width, 'Arrow buttons, rapid advance, keyboard Home/End/Left/Right and cover focus');
      await select(page, 0); await page.locator('.album-stage').scrollIntoViewIfNeeded();
      const box = await page.locator('.album-stage').boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      const vertical = await page.evaluate(() => scrollY);
      await page.mouse.wheel(600, 0);
      await page.waitForFunction(() => Number(document.querySelector('[data-selected="true"]').dataset.album) > 0);
      assert.equal(new URL(page.url()).pathname, '/index.html');
      assert(Math.abs(await page.evaluate(() => scrollY) - vertical) < 3);
      await page.mouse.wheel(-1400, 0); await centered(page, 0);
      pass(width, 'Native horizontal trackpad/wheel browsing in both directions');
      await drag(page, width < 600 ? 150 : 320);
      await page.waitForFunction(() => Number(document.querySelector('[data-selected="true"]').dataset.album) > 0);
      await select(page, 0); await drag(page, width < 600 ? 150 : 320, true);
      await select(page, 4);
      pass(width, 'Mouse grab/drag, interrupted drag and click suppression');
      if (engine === 'chromium' && width < 600) {
        const session = await context.newCDPSession(page);
        await select(page, 0); await swipe(page, session, -145, 0);
        await page.waitForFunction(() => Number(document.querySelector('[data-selected="true"]').dataset.album) > 0);
        await select(page, 0); await page.locator('.album-stage').scrollIntoViewIfNeeded();
        const y = await page.evaluate(() => scrollY);
        await swipe(page, session, 0, -180);
        assert(await page.evaluate(() => scrollY) > y + 40, 'Vertical touch scroll must still move the page');
        await select(page, 0); await swipe(page, session, -40, 0, true);
        assert.equal(await page.locator('.is-dragging').count(), 0);
        await session.detach();
        pass(width, 'Native touch swipe, vertical page scroll and cancelled touch gesture');
      }
      assert.deepEqual(await snapshot(page), before, 'Every browsing gesture must preserve the full planning snapshot');
      pass(width, 'Strict full snapshot equality after all browsing gestures');
      await select(page, 4);
      await page.setViewportSize({width: width === 1440 ? 720 : 430, height: 1000}); await centered(page, 4);
      await page.setViewportSize({width, height: 1000}); await centered(page, 4);
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => { location.hash = 'area/event'; });
        await page.locator('.album-stage').waitFor({state: 'detached'});
        await page.goBack(); await page.locator('.album-stage[data-ready="true"]').waitFor(); await select(page, 2);
      }
      assert.deepEqual(await snapshot(page), before, 'Resize and repeated route changes must preserve every planning field');
      pass(width, 'Resize preserves selection; repeated deep-link/unmount/Back reinitializes safely');
      await page.addScriptTag({path: '/tmp/atlas-a11y/node_modules/axe-core/axe.min.js'});
      for (const theme of ['light', 'dark']) {
        if (theme === 'dark') await page.locator('#atlas-theme-toggle').click();
        for (let i = 0; i < 6; i++) {
          await select(page, i); await page.waitForTimeout(150);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          const violations = await page.evaluate(async () => (await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']}})).violations.map(v => ({id: v.id, targets: v.nodes.map(n => n.target)})));
          assert.deepEqual(violations, []);
          pass(width, 'Accessible album and layout', {theme, album: i + 1});
        }
        if (width !== 320) {
          await select(page, 2); await page.locator('.album-carousel').scrollIntoViewIfNeeded();
          await page.evaluate(() => document.activeElement.blur());
          await page.screenshot({path: path.join(folder, width + '-' + engine + '-' + theme + '-carousel.png')});
        }
      }
      const tour = page.locator('#atlas-tutorial'); await tour.locator('#launch').click(); let steps = 0;
      while (await tour.locator('#panel').isVisible()) {
        await page.waitForTimeout(180); assert(await tour.locator('#ring').isVisible());
        if (steps === 1) assert.match(await tour.locator('#text').textContent(), /Click an album cover/);
        await tour.locator('#next').click(); assert(++steps <= 5);
      }
      assert.equal(steps, 4); pass(width, 'Updated four-step home tutorial');
      await page.emulateMedia({reducedMotion: 'reduce'}); await select(page, 5);
      assert.equal(await page.locator('[data-album="5"]').evaluate(element => getComputedStyle(element).transform), 'none');
      await centered(page, 5); pass(width, 'Reduced-motion browsing');
      await page.locator('[data-album="5"]').tap(); await page.waitForURL(base + '/assistant.html');
      pass(width, 'Intentional tap still opens after browsing and cancellations');
      assert.deepEqual(errors, []); await context.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(folder, engine + '-gestures.json'), JSON.stringify({engine, results, productionRecordMutations: 0}, null, 2));
  }
})().catch(error => { console.error(error); process.exit(1); });
