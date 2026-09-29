/* User-flow checks exercise real browser persistence in an isolated context, never a user's plan. */
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
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const open = async (mode) => {
    await page.locator(".workspace-nav").click();
    await page.locator(`[data-action="delivery"][data-mode="${mode}"]`).click();
  };
  const edit = async (selector, value) => {
    await page.locator(selector).fill(value);
    await page.locator(selector).blur();
  };
  try {
    await page.goto(base);
    assert.equal(
      await page.locator(".sphere-enter h2").textContent(),
      "Atlas Agentic AI Hackathon 2027",
    );
    assert.equal(await page.locator(".metric-card").count(), 2);
    assert.match(
      await page.locator(".metric-card").nth(1).innerText(),
      /Participation confirmations/,
    );
    await page.locator(".workspace-nav").click();
    await page
      .locator('[data-action="quick-list"][data-list="ws01-work"]')
      .click();
    const first = page.locator("#itemRows .item-row").first();
    const id = await first.getAttribute("data-id");
    await first.locator("summary").click();
    assert(await first.locator("textarea").isVisible());
    await page.locator(`[data-item-complete="${id}"]`).click();
    assert.equal(
      await page.locator(`#itemRows .item-row[data-id="${id}"]`).count(),
      0,
    );
    await page.locator(".completed-items > summary").click();
    assert.equal(
      await page.locator(`.completed-items .item-row[data-id="${id}"]`).count(),
      1,
    );
    // Completion survives reload and remains reversible without losing notes.
    await page.reload();
    await page.locator(".workspace-nav").click();
    await page
      .locator('[data-action="quick-list"][data-list="ws01-work"]')
      .click();
    await page.locator(".completed-items > summary").click();
    await page
      .locator(
        `.completed-items .item-row[data-id="${id}"] [data-item-complete]`,
      )
      .click();
    assert.equal(
      await page.locator(`#itemRows .item-row[data-id="${id}"]`).count(),
      1,
    );
    await open("owners");
    await edit(
      '[data-owner-field="accountableOwner"][data-ws="ws01"]',
      "Test owner",
    );
    assert.match(
      await page.locator(".review-summary").last().innerText(),
      /Test owner/,
    );
    await page.locator('[data-review-tab="recruitment"]').click();
    await page.locator('[name="title"]').fill("Test university");
    await page.locator("#add-recruitment button").click();
    await page.locator(".review-record summary").click();
    for (const [key, value] of [
      ["population", "1000"],
      ["share", "20"],
      ["conversion", "50"],
      ["steps", "Robotics club workshop"],
    ])
      await edit(`[data-field="${key}"]`, value);
    assert.match(
      await page.locator(".review-record summary").innerText(),
      /Forecast 100/,
    );
    assert.match(
      await page.locator(".review-record summary").innerText(),
      /Confirmed —/,
    );
    await page.locator('[data-review-tab="dependencies"]').click();
    await page.locator('[name="from"]').selectOption("ws01");
    await page.locator('[name="to"]').selectOption("ws02");
    await page.locator('[name="condition"]').fill("Approve requirements");
    await page.locator("#add-dependency button").click();
    await page.locator('[name="from"]').selectOption("ws02");
    await page.locator('[name="to"]').selectOption("ws01");
    await page.locator('[name="condition"]').fill("Circular");
    await page.locator("#add-dependency button").click();
    assert.match(await page.locator("#review-message").innerText(), /cycle/);
    assert.equal(await page.locator(".review-record").count(), 1);
    await page.locator('[data-review-tab="publication"]').click();
    await page.locator(".review-record summary").first().click();
    const root = '[data-review-record="publication-0"]';
    await page.locator(`${root}[data-field="status"]`).selectOption("Ready");
    assert.equal(
      await page.locator(`${root}[data-field="status"]`).inputValue(),
      "Draft",
    );
    for (const [key, value] of [
      ["owner", "Test reviewer"],
      ["date", "2026-09-29"],
      ["evidence", "Test-only written confirmation"],
    ])
      await edit(`${root}[data-field="${key}"]`, value);
    await page.locator(`${root}[data-field="status"]`).selectOption("Ready");
    assert.equal(
      await page.locator(`${root}[data-field="status"]`).inputValue(),
      "Ready",
    );
    await edit(`${root}[data-field="evidence"]`, "");
    assert.equal(
      await page.locator(`${root}[data-field="status"]`).inputValue(),
      "In review",
    );
    await page.reload();
    await open("recruitment");
    assert.match(
      await page.locator(".review-record summary").innerText(),
      /Forecast 100/,
    );
    await page.screenshot({ path: "/tmp/atlas-recruitment.png" });
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const mode of [
        "progress",
        "owners",
        "recruitment",
        "dependencies",
        "decisions",
        "publication",
      ]) {
        await page.locator(`[data-review-tab="${mode}"]`).click();
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${mode} at ${width}`,
        );
      }
    }
    await page.goto(new URL("atlas-reference.html#people", base).href);
    await page.locator('[data-prole="Speakers"]').click();
    await page.locator("#peopleSearch").fill("Booth");
    assert.match(
      await page.locator("#peopleResultCount").innerText(),
      /people/,
    );
    assert((await page.locator(".person-card").count()) > 0);
    assert.equal(
      await page.locator('[data-prole="All"]').getAttribute("aria-pressed"),
      "true",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: heading, two metrics, task details/completion/reopen/persistence, ownership, forecast, dependency cycle prevention, evidence gate, mobile views and global Booth search.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
