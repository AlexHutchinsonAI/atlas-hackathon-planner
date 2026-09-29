/* Server-side authorization: editable display names never grant permission. */
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const companyEmail = (email) =>
  typeof email === "string" &&
  /^[^@\s]+@intellibus\.com$/i.test(email) &&
  !email.toLowerCase().includes("+clerk_test");
const lists = (w) =>
  (w.lists || []).flatMap(function flatten(l) {
    return [l, ...(l.children || []).flatMap(flatten)];
  });
function validPlan(plan) {
  if (
    !plan ||
    plan.version !== 1 ||
    !Array.isArray(plan.workstreams) ||
    !plan.command ||
    !Array.isArray(plan.command.metrics)
  )
    return false;
  const ids = new Set();
  for (const w of plan.workstreams) {
    if (
      !w ||
      typeof w.id !== "string" ||
      ids.has(w.id) ||
      !Array.isArray(w.lists)
    )
      return false;
    ids.add(w.id);
    for (const l of lists(w)) {
      if (
        !l ||
        typeof l.id !== "string" ||
        ids.has(l.id) ||
        !Array.isArray(l.items)
      )
        return false;
      ids.add(l.id);
      for (const it of l.items) {
        if (
          !it ||
          typeof it.id !== "string" ||
          ids.has(it.id) ||
          typeof it.text !== "string"
        )
          return false;
        ids.add(it.id);
      }
    }
  }
  return true;
}
const order = (items) => (items || []).map((x) => x.id);
function authorize(old, next, actor) {
  if (!companyEmail(actor.email))
    return "A verified Intellibus email is required.";
  if (!validPlan(next))
    return "Invalid plan structure or duplicate record IDs.";
  for (const w of next.workstreams)
    if (w.ownerEmail && !companyEmail(w.ownerEmail))
      return "Owner email must be an Intellibus address.";
  for (const group of ["publication", "decisions"])
    for (const r of next.walkthrough?.[group] || [])
      if (
        ["Ready", "Decided"].includes(r.status) &&
        (!r.owner || !r.date || !r.evidence)
      )
        return "Approval needs an owner, date and evidence.";
  if (actor.manager) return null;
  if (!equal(order(old.workstreams), order(next.workstreams)))
    return "A manager must add, remove or reorder workstreams.";
  for (const before of old.workstreams) {
    const after = next.workstreams.find((w) => w.id === before.id);
    if (
      !equal(
        [before.ownerEmail, before.accountableOwner],
        [after.ownerEmail, after.accountableOwner],
      )
    )
      return "Only a manager can assign an accountable owner.";
    const owns = before.ownerEmail?.toLowerCase() === actor.email.toLowerCase();
    if (owns) continue;
    if (!equal(order(lists(before)), order(lists(after))))
      return "Only the assigned owner can add, remove or reorder workstream lists.";
    for (const l of lists(before)) {
      const n = lists(after).find((x) => x.id === l.id);
      if (l.review !== n.review)
        return "Only the assigned owner can sign off this list.";
      // Existing tasks must remain in order. New tasks may be appended by contributors.
      const previous = order(l.items),
        known = new Set(previous);
      if (
        !equal(
          previous,
          order(n.items).filter((id) => known.has(id)),
        )
      )
        return "Only the assigned owner can remove or reorder tasks.";
    }
  }
  for (const group of ["publication", "decisions"]) {
    const before = old.walkthrough?.[group] || [],
      after = next.walkthrough?.[group] || [];
    for (const r of after) {
      const prev = before.find((x) => x.id === r.id);
      if (
        (["Ready", "Decided"].includes(r.status) ||
          ["Ready", "Decided"].includes(prev?.status)) &&
        !equal(prev, r)
      )
        return "A manager must approve or change a signed-off decision or publication record.";
    }
    if (
      before.some(
        (r) =>
          ["Ready", "Decided"].includes(r.status) &&
          !after.some((x) => x.id === r.id),
      )
    )
      return "A manager must remove a signed-off record.";
  }
  return null;
}
module.exports = { authorize, companyEmail, validPlan };
