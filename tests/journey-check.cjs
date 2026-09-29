/* Verify deep camera travel and scrollable data without altering the user's saved plan. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(process.env.ATLAS_URL || "http://127.0.0.1:8765/");
    await page.waitForFunction(
      () => window.AtlasSphere?.state()?.renderer === "webgl",
    );
    await page.locator('[data-sphere-step="0.73"]').click();
    await page.waitForTimeout(1600);
    assert.equal(await page.evaluate(() => AtlasSphere.state().phase), "atoms");
    await page.screenshot({ path: "/tmp/atlas-atoms.png" });
    await page.locator('[data-sphere-step="0.96"]').click();
    await page.waitForTimeout(1600);
    assert((await page.evaluate(() => AtlasSphere.state().camera))[2] < -15);
    await page.locator("#journey-tasks").scrollIntoViewIfNeeded();
    assert((await page.locator(".library-task").count()) > 500);
    const library = page.locator(".task-library");
    await library.hover();
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(200);
    assert(
      (await library.evaluate((el) => el.scrollTop)) > 0,
      "native scroll moves the data region",
    );
    await page.locator("#journey-owners").scrollIntoViewIfNeeded();
    await page.screenshot({ path: "/tmp/atlas-glass-planning.png" });
    await page.locator(".operations-flow").scrollIntoViewIfNeeded();
    const frame = page.frameLocator(".operations-flow");
    await frame.locator("#peopleGrid .person-card").first().waitFor();
    assert.equal(await frame.locator("#peopleGrid .person-card").count(), 176);
    assert.equal(
      await frame.locator(".operations-chapters > .depth-chapter").count(),
      7,
    );
    assert.equal(await frame.locator("#transportPageView").isVisible(), true);
    assert(
      await page
        .locator(".operations-flow")
        .evaluate((el) => parseInt(el.style.height) > 1000),
    );
    await page.waitForTimeout(500);
    assert(
      await page
        .locator(".operations-flow")
        .evaluate((el) => el.offsetHeight < 12000),
      "embedded viewport sizing settles without runaway growth",
    );
    await page.locator('[data-action="toggle-motion"]').click();
    await page.waitForTimeout(200);
    assert(
      await frame
        .locator("body")
        .evaluate((el) => el.classList.contains("motion-paused")),
      "motion pause reaches embedded chapters",
    );
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.waitForTimeout(300);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `outer width ${width}`,
      );
      assert(
        await frame
          .locator("html")
          .evaluate((el) => el.scrollWidth <= innerWidth),
        `embedded width ${width}`,
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      "PASS: atomic depth, native data scrolling, all tasks, 176 profiles, seven operations sections, responsive embedded layout, no JS errors.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
