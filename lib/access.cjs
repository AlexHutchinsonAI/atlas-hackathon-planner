// Policy remains disabled until an explicitly approved membership policy is configured.
const emails = value => String(value || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
function access(email, env = process.env) {
 const policy = env.ATLAS_ACCESS_POLICY;
 const valid = typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && !email.toLowerCase().includes('+clerk_test');
 if (!valid) return {allowed:false, manager:false, readOnly:true};
 email = email.toLowerCase();
 const allowed = policy === 'verified-email' || (policy === 'company' && email.endsWith('@intellibus.com')) || (policy === 'invited' && emails(env.ATLAS_MEMBER_EMAILS).includes(email));
 const manager = allowed && email.endsWith('@intellibus.com') && emails(env.ATLAS_MANAGER_EMAILS).includes(email);
 return {allowed,manager,readOnly:policy === 'verified-email' && !manager};
}
const policyConfigured = (env = process.env) => ['verified-email','company','invited'].includes(env.ATLAS_ACCESS_POLICY);
module.exports = {access,policyConfigured};
