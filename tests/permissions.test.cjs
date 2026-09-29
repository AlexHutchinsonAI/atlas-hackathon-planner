/* Authorization tests cover malicious clients, not just disabled interface controls. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  authorize,
  companyEmail,
  validPlan,
} = require("../lib/permissions.cjs");
const seed = require("../data/command-seed.js");
const copy = () => structuredClone(seed);
const contributor = { email: "contributor@intellibus.com", manager: false };
test("company boundary rejects lookalike domains and provider testing addresses", () => {
  assert(companyEmail("person@intellibus.com"));
  for (const email of [
    "a@intellibus.com.evil.com",
    "a@example.com",
    "a+clerk_test@intellibus.com",
    "a@@intellibus.com",
  ])
    assert(!companyEmail(email));
});
test("seed has valid unique record identifiers", () => assert(validPlan(seed)));
test("contributor can update task status but cannot sign off a list", () => {
  const next = copy();
  next.workstreams[0].lists[0].items[0].status = "Done";
  assert.equal(authorize(seed, next, contributor), null);
  next.workstreams[0].lists[0].review = "Checked";
  assert.match(authorize(seed, next, contributor), /sign off/);
});
test("display names cannot grant owner rights", () => {
  const next = copy();
  next.workstreams[0].ownerEmail = contributor.email;
  assert.match(authorize(seed, next, contributor), /assign/);
});
test("only the existing owner can reorder tasks", () => {
  const old = copy();
  old.workstreams[0].ownerEmail = "owner@intellibus.com";
  const next = structuredClone(old);
  next.workstreams[0].lists[0].items.reverse();
  assert.match(authorize(old, next, contributor), /reorder/);
  assert.equal(authorize(old, next, { email: "owner@intellibus.com" }), null);
});
test("contributor cannot delete an approved publication record", () => {
  const old = copy();
  old.walkthrough = { publication: [{ id: "p", status: "Ready" }] };
  const next = structuredClone(old);
  next.walkthrough.publication = [];
  assert.match(authorize(old, next, contributor), /signed-off/);
});
test("manager still cannot save malformed or outsider data", () => {
  assert.equal(
    authorize(seed, copy(), { email: "manager@intellibus.com", manager: true }),
    null,
  );
  assert.match(
    authorize(seed, {}, { ...contributor, manager: true }),
    /Invalid/,
  );
  assert.match(
    authorize(seed, copy(), { email: "outsider@example.com", manager: true }),
    /verified/,
  );
});
