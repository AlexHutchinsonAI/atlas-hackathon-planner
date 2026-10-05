/* Legacy operational records share a separate document; verified editors may change planner content. */
const { identity, sql, environment } = require("../lib/team.cjs");
const keys = [
  "plans",
  "custom",
  "execState",
  "webState",
  "judgeState",
  "actState",
  "qState",
  "reviewState",
  "ambassadorState",
  "goalState",
];
const baseline = () =>
  Object.fromEntries(
    keys.map((k) => [
      k,
      k === "custom"
        ? []
        : k === "execState"
          ? { goals: {}, decisions: {} }
          : {},
    ]),
  );
const {saveWithActivity}=require('../lib/activity.cjs');
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "PUT"].includes(req.method)) {
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const actor = await identity(req),
      db = sql(),
      scope = environment() + ":operations";
    await db`INSERT INTO atlas_plans(scope,body,revision) VALUES(${scope},${JSON.stringify(baseline())},0) ON CONFLICT(scope) DO NOTHING`;
    const [current] =
      await db`SELECT body,revision FROM atlas_plans WHERE scope=${scope}`;
    if (req.method === "GET") return res.json({ ...current, actor });
    if (actor.readOnly || (!actor.editor && !actor.manager))
      return res
        .status(403)
        .json({
          error:
            "Sign in with a verified email to edit shared planner content.",
        });
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (
      !body ||
      !Number.isSafeInteger(body.revision) ||
      !body.plan ||
      !keys.every((k) => body.plan[k] && typeof body.plan[k] === "object") ||
      !Array.isArray(body.plan.custom) ||
      JSON.stringify(body.plan).length > 2000000
    )
      return res.status(400).json({ error: "Invalid operations document" });
    if ((body.operation==='import' || current.revision===0) && !actor.manager) return res.status(403).json({error:'Only the planner owner may initialize or import a shared baseline.'});
    const plan = Object.fromEntries(keys.map((k) => [k, body.plan[k]]));
    const [saved] =
      await saveWithActivity(db,{scope,revision:body.revision,plan,actor,current:current.body,kind:"operations"});
    if (!saved)
      return res
        .status(409)
        .json({
          error:
            "The shared operations changed. Export your draft and reload the shared version.",
        });
    return res.json(saved);
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({
        error: e.status
          ? e.message
          : "Operations could not sync. Your local draft is retained.",
      });
  }
};
