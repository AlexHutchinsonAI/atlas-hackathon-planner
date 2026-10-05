/* Only a publishable key is exposed; development credentials are never enabled in production. */
const { configured } = require("../lib/team.cjs");
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const enabled=configured(), provider=process.env.ATLAS_AUTH_PROVIDER === 'firebase' ? 'firebase' : 'clerk';
  res.status(200).json({enabled,provider,verifiedEditors:enabled && provider==='firebase' && process.env.ATLAS_VERIFIED_EDITORS==='true',publishableKey:enabled && provider==='clerk' ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY : null,firebase:enabled && provider==='firebase' ? require('../lib/firebase.cjs').webConfig() : null,accessPolicy:enabled ? process.env.ATLAS_ACCESS_POLICY : null});
};
