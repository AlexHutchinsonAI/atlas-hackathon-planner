/* Only a publishable key is exposed; development credentials are never enabled in production. */
const { configured } = require("../lib/team.cjs");
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res
    .status(200)
    .json({
      enabled: configured(),
      publishableKey: configured()
        ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        : null,
      accessPolicy: configured() ? process.env.ATLAS_ACCESS_POLICY : null,
    });
};
