// Creates a new coach (admin) account: an Auth user with the role:coach
// custom claim and a matching users/{uid} document.
//
// Usage: npm run create-coach -- <email> <password>
//
// Credentials come from backend/serviceAccount.json (or the
// FIREBASE_SERVICE_ACCOUNT_BASE64 env) - see src/config/firebase.ts.
import { auth, db } from "./config/firebase.js";

const [emailArg, passwordArg] = process.argv.slice(2);

if (!emailArg || !passwordArg) {
  console.error("Usage: npm run create-coach -- <email> <password>");
  process.exit(1);
}

const email = emailArg;
const password = passwordArg;

if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error(`"${email}" does not look like an email address.`);
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

async function main() {
  // Always create a fresh account. If the email is taken, fail loudly rather
  // than silently taking over an existing user.
  let uid: string;
  try {
    const user = await auth.createUser({ email, password });
    uid = user.uid;
  } catch (err) {
    if ((err as { code?: string }).code === "auth/email-already-exists") {
      console.error(`${email} already has an account. Use a different email.`);
      process.exit(1);
    }
    throw err;
  }

  await auth.setCustomUserClaims(uid, { role: "coach" });
  await db.doc(`users/${uid}`).set({
    role: "coach",
    email,
    name: "Coach",
    must_change_password: false
  });

  console.log(`Coach account created: ${email}`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("Failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
);
