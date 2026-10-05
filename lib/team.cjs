/* Verify the provider token and the current verified email on every shared-plan request. */
const { createClerkClient, verifyToken } = require("@clerk/backend");
const { neon } = require("@neondatabase/serverless");
const { access, policyConfigured } = require("./access.cjs");
function configured() {
  if(process.env.ATLAS_AUTH_PROVIDER === "firebase") return Boolean(policyConfigured() && process.env.DATABASE_URL && !(process.env.VERCEL_ENV === "production" && process.env.FIREBASE_AUTH_EMULATOR_HOST) && require("./firebase.cjs").webConfig());
  return (
    policyConfigured() && Boolean(
      process.env.CLERK_SECRET_KEY &&
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        process.env.DATABASE_URL,
    ) &&
    (process.env.VERCEL_ENV !== "production" ||
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_live_"))
  );
}
async function identity(req) {
  if (!configured())
    throw Object.assign(
      new Error("Team sign-in is awaiting production domain setup."),
      { status: 503 },
    );
  if(process.env.ATLAS_AUTH_PROVIDER === "firebase") return require("./firebase.cjs").identity(req);
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token)
    throw Object.assign(new Error("Sign in with your email."), {
      status: 401,
    });
  let claims, user;
  try {
    const host = process.env.VERCEL_URL;
    const origins = [
      ...(
        process.env.ATLAS_ALLOWED_ORIGINS ||
        "https://atlas-hackathon-planner.vercel.app"
      ).split(","),
      ...(host ? [`https://${host}`] : []),
      ...(process.env.VERCEL_ENV !== "production"
        ? ["http://localhost:3000", "http://127.0.0.1:3000"]
        : []),
    ];
    claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: origins,
    });
    user = await createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    }).users.getUser(claims.sub);
  } catch {
    throw Object.assign(new Error("Your sign-in has expired or is invalid."), {
      status: 401,
    });
  }
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId,
  );
  if (
    primary?.verification?.status !== "verified"
  )
    throw Object.assign(
      new Error("Use a verified primary email."),
      { status: 403 },
    );
  const email = primary.emailAddress.toLowerCase();
  const membership = access(email);
  if (!membership.allowed) throw Object.assign(new Error("This account does not have planner access."), {status:403});
  return {id:user.id,email,...membership};
}
const sql = () => neon(process.env.DATABASE_URL);
const environment = () =>
  process.env.VERCEL_ENV === "production" ? "production" : "preview";
module.exports = { configured, identity, sql, environment };
