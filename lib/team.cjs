/* Verify the provider token and the current verified email on every shared-plan request. */
const { createClerkClient, verifyToken } = require("@clerk/backend");
const { neon } = require("@neondatabase/serverless");
const { companyEmail } = require("./permissions.cjs");
function configured() {
  return (
    Boolean(
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
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token)
    throw Object.assign(new Error("Sign in with your Intellibus email."), {
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
    primary?.verification?.status !== "verified" ||
    !companyEmail(primary.emailAddress)
  )
    throw Object.assign(
      new Error("Use a verified @intellibus.com primary email."),
      { status: 403 },
    );
  const email = primary.emailAddress.toLowerCase();
  return {
    id: user.id,
    email,
    manager: (process.env.ATLAS_MANAGER_EMAILS || "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .includes(email),
  };
}
const sql = () => neon(process.env.DATABASE_URL);
const environment = () =>
  process.env.VERCEL_ENV === "production" ? "production" : "preview";
module.exports = { configured, identity, sql, environment };
