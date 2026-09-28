/* Visual-surface regression: scoped enhancements, routes, editing and motion preferences. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const base = process.env.ATLAS_URL || "http://127.0.0.1:8765/";
(async () => {
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "chrome",
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(base);
    await page.waitForFunction(
      () => window.AtlasSurfaces?.state()?.renderer === "webgl",
    );
    assert.equal(
      await page.locator(".sphere-journey .surface-orbit").count(),
      0,
      "approved hero is outside enhancement scope",
    );
    await page.locator(".workspace-nav").click();
    assert.equal(
      await page.locator(".workspace-utilities > details").count(),
      4,
    );
    assert.equal(
      await page
        .locator(".workspace-utilities")
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
        ),
      2,
    );
    await page.locator(".stream-title").first().click();
    await page.waitForFunction(() =>
      document.querySelector(".planning-surface .surface-orbit canvas"),
    );
    await page.locator("#listRows .row-title").first().click();
    const status = page.locator("[data-item-status]").first();
    const id = await status.getAttribute("data-item-status");
    await status.selectOption("Doing");
    await page.locator(".workspace-nav").click();
    await page.locator(".stream-title").first().click();
    await page.locator("#listRows .row-title").first().click();
    assert.equal(
      await page.locator(`[data-item-status="${id}"]`).inputValue(),
      "Doing",
      "editing survives page changes",
    );
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of [
        "",
        "#people",
        "#direction",
        "#outcomes",
        "#notebook",
        "#web",
        "#open",
        "#transport",
      ]) {
        await page.goto(base + (route ? "atlas-reference.html" + route : ""));
        await page.waitForFunction(
          () => window.AtlasSurfaces?.state()?.renderer === "webgl",
        );
        // Exercise the existing navigation, including views reached through its tabs.
        if (route)
          await page.locator(`[data-view="${route.slice(1)}"]`).click();
        if (!route) await page.locator(".workspace-nav").click();
        else
          assert.equal(
            await page.locator("body").getAttribute("data-section"),
            route.slice(1),
            "requested page is actually active",
          );
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `overflow: ${route || "workspace"} at ${width}`,
        );
        assert.equal(
          await page.locator(".surface-orbit").count(),
          1,
          "only one decorative surface scene is mounted",
        );
        if (
          process.env.ATLAS_SCREENSHOTS &&
          width === 390 &&
          ["", "#people", "#outcomes"].includes(route)
        ) {
          await page.waitForTimeout(700);
          await page.screenshot({
            path:
              "/tmp/mobile-polish-" + (route.slice(1) || "workspace") + ".png",
          });
        }
      }
    }
    await page.locator("[data-motion-toggle]").click();
    await page.waitForFunction(() => AtlasSurfaces.state().paused);
    await page.locator('[data-view="people"]').click();
    await page.waitForFunction(() => AtlasSurfaces.state().paused);
    await page.locator("[data-profile]").first().click();
    assert(await page.locator("#personDialog").evaluate((el) => el.open));
    await page.keyboard.press("Escape");
    await page.locator("[data-motion-toggle]").click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(() => AtlasSurfaces.state().paused);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: untouched hero scope, utility layout, task edits, all main pages at four viewport sizes, profile dialog and shared motion preference.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
