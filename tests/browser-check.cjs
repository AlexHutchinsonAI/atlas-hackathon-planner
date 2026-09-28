/* Browser regression checks for the unified directory, routes, motion and saved planning edits. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const base = process.env.ATLAS_URL || "http://127.0.0.1:8765/";
(async () => {
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "chrome",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    // Fresh browser storage ensures these edits never touch a user's working copy.
    await page.goto(base);
    assert.equal(await page.locator(".metric-card").count(), 5);
    await page.locator(".numbers-panel summary").click();
    await page.locator('[data-metric-current="registrations"]').fill("123");
    await page.locator('[data-metric-current="registrations"]').blur();
    await page.reload();
    assert.equal(
      await page.locator(".metric-card strong").first().innerText(),
      "123",
    );
    await page.locator('a.nav-link[href*="#people"]').click();
    assert.equal(
      await page.locator(".people-metric b").first().innerText(),
      "176",
    );
    await page.locator('[data-prole="Judges"]').click();
    assert.match(
      await page.locator("#peopleResultCount").innerText(),
      /^42 judges/,
    );
    await page.locator('[data-prole="Coaches"]').click();
    assert.match(
      await page.locator("#peopleResultCount").innerText(),
      /^58 coaches/,
    );
    await page.locator('[data-prole="All"]').click();
    await page.locator("#peopleSearch").fill("Edouard");
    assert.equal(await page.locator(".person-card").count(), 1);
    await page.locator("[data-profile]").click();
    assert(
      await page.locator("#personDialog").evaluate((dialog) => dialog.open),
    );
    await page.keyboard.press("Escape");
    assert(
      !(await page.locator("#personDialog").evaluate((dialog) => dialog.open)),
    );
    await page.locator("#peopleSearch").fill("");
    await page.locator('[data-people-page="1"]').click();
    assert.match(await page.locator("#peopleResultCount").innerText(), /9–16/);
    // Every retained operations screen must render without horizontal page overflow.
    for (const view of [
      "direction",
      "outcomes",
      "notebook",
      "web",
      "open",
      "transport",
      "people",
    ]) {
      await page.locator(`[data-view="${view}"]`).click();
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        view,
      );
    }
    await page.locator("[data-motion-toggle]").click();
    assert(
      await page
        .locator("body")
        .evaluate((body) => body.classList.contains("motion-paused")),
    );
    await page.locator('[data-people-page="-1"]').click();
    await page.locator("[data-profile]").first().click();
    await page.waitForTimeout(400);
    assert.equal(
      await page
        .locator("#personDialog")
        .evaluate((dialog) => getComputedStyle(dialog).opacity),
      "1",
    );
    await page.keyboard.press("Escape");
    for (const width of [768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.reload();
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `people ${width}`,
      );
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base);
    await page.waitForFunction(() => window.AtlasSphere?.state()?.static);
    assert.equal(await page.locator(".sphere-progress").isVisible(), false);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: saved counts, directory totals, search, profiles, pagination, operations, mobile and motion.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
