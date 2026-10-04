/* Optimistic revisions prevent concurrent editors from silently overwriting one another. */
const { identity, sql, environment } = require("../lib/team.cjs");
const { authorize, validPlan } = require("../lib/permissions.cjs");
const seed = require("../data/command-seed.js");
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "PUT"].includes(req.method)) {
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const actor = await identity(req),
      db = sql(),
      scope = environment();
    await db`INSERT INTO atlas_plans (scope,body,revision) VALUES (${scope},${JSON.stringify(seed)},0) ON CONFLICT (scope) DO NOTHING`;
    const [current] =
      await db`SELECT body,revision FROM atlas_plans WHERE scope=${scope}`;
    if (req.method === "GET") return res.json({ ...current, actor });
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (
      !body ||
      !Number.isSafeInteger(body.revision) ||
      !validPlan(body.plan) ||
      JSON.stringify(body.plan).length > 2000000
    )
      return res.status(400).json({ error: "Invalid plan or revision" });
    if (body.revision !== current.revision)
      return res
        .status(409)
        .json({
          error:
            "The shared plan changed. Export your draft, then reload the shared version before retrying.",
        });
    if (actor.readOnly) return res.status(403).json({error:"Your account has view-only access."});
    const denial = authorize(current.body, body.plan, actor);
    if (denial) return res.status(403).json({ error: denial });
    const [updated] =
      await db`UPDATE atlas_plans SET body=${JSON.stringify(body.plan)},revision=revision+1,updated_at=now(),updated_by=${actor.email} WHERE scope=${scope} AND revision=${body.revision} RETURNING revision`;
    if (!updated)
      return res
        .status(409)
        .json({
          error:
            "Another editor saved first. Reload the shared plan before retrying.",
        });
    return res.json({ revision: updated.revision });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({
        error: error.status
          ? error.message
          : "The shared plan could not be saved or loaded. Your local draft is retained.",
      });
  }
};
