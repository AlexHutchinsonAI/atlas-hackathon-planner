/* Exercise native-scroll camera travel, real shortcuts, GPU lifecycle and accessible fallbacks. */
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
  page.on("pageerror", (e) => errors.push(e.message));
  const ready = () =>
    page.waitForFunction(
      () => window.AtlasSphere?.state()?.renderer === "webgl",
    );
  try {
    await page.goto(base);
    await ready();
    const start = await page.evaluate(() => AtlasSphere.state().camera);
    for (const [step, phase] of [
      ["0.28", "enter"],
      ["0.52", "inside"],
      ["0.73", "atoms"],
      ["0.96", "field"],
      ["0", "overview"],
    ]) {
      await page.locator(`[data-sphere-step="${step}"]`).click();
      await page.waitForFunction((p) => AtlasSphere.state().phase === p, phase);
      await page.waitForTimeout(1000);
      const state = await page.evaluate(() => AtlasSphere.state());
      assert.equal(state.phase, phase);
      assert(
        Math.abs(state.progress - Number(step)) < 0.03,
        "scroll position reaches selected stage",
      );
      if (phase === "inside") {
        assert(state.camera[2] < 2, "camera enters the sphere");
        assert(
          await page.locator(".sphere-overview").evaluate((el) => el.inert),
        );
        assert.equal(
          await page.locator(".sphere-inside").evaluate((el) => el.inert),
          false,
        );
      }
    }
    const returned = await page.evaluate(() => AtlasSphere.state().camera);
    assert(
      Math.abs(start[2] - returned[2]) < 0.1,
      "reverse scroll restores camera",
    );
    await page.locator(".workspace-nav").click();
    assert.equal(
      await page
        .locator("#deck-search")
        .evaluate((el) => document.activeElement === el),
      true,
    );
    const y = await page
      .locator("#workspace")
      .evaluate((el) => el.getBoundingClientRect().top);
    assert(y >= 60 && y < 100, "workspace shortcut bypasses journey");
    await page.locator(".logo-home").click();
    await ready();
    assert.equal(await page.locator(".sphere-canvas canvas").count(), 1);
    await page.locator('.sphere-actions [data-action="open-area"]').click();
    assert.equal(await page.locator(".sphere-journey").count(), 0);
    await page.locator(".workspace-nav").click();
    await ready();
    assert.equal(await page.locator(".sphere-canvas canvas").count(), 1);
    await page.locator(".logo-home").click();
    await ready();
    await page.locator('[data-action="toggle-motion"]').click();
    await page.waitForFunction(() => AtlasSphere.state().static);
    assert.equal(await page.locator(".sphere-progress").isVisible(), false);
    await page.locator('[data-action="toggle-motion"]').click();
    await page.waitForFunction(() => !AtlasSphere.state().static);
    for (const width of [768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.reload();
      await ready();
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `no overflow at ${width}`,
      );
      await page.locator(".workspace-nav").click();
      assert(await page.locator("#deck-search").isVisible());
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base);
    await ready();
    await page.waitForFunction(() => AtlasSphere.state().static);
    assert.equal(await page.locator(".sphere-progress").isVisible(), false);
    const heights = await page
      .locator(".sphere-journey")
      .evaluate((el) => [
        el.offsetHeight,
        el.querySelector(".sphere-stage").offsetHeight,
      ]);
    assert.equal(heights[0], heights[1], "reduced motion removes extra travel");
    // A browser without WebGL still has usable HTML navigation and a static globe.
    const fallback = await browser.newPage();
    await fallback.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return type.startsWith("webgl") ? null : get.call(this, type, ...args);
      };
    });
    await fallback.goto(base);
    await fallback.waitForFunction(
      () => window.AtlasSphere?.state()?.renderer === "fallback",
    );
    await fallback.locator(".workspace-nav").click();
    assert(await fallback.locator("#deck-search").isVisible());
    await fallback.locator('.nav-link[href*="#people"]').click();
    assert.equal(
      await fallback.locator(".people-metric b").first().innerText(),
      "176",
    );
    await fallback.close();
    assert.deepEqual(errors, []);
    console.log(
      "PASS: forward/reverse sphere travel, working shortcuts, remounts, pause, reduced motion, responsive layouts and WebGL fallback.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
