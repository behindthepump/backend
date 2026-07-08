// Post-swap smoke check: confirms the service-account key loads, the project
// is reachable, and a coach account exists. Run after replacing serviceAccount.json.
//   npm run verify
import { db } from "./config/firebase.js";

async function main() {
  const coachSnap = await db.collection("users").where("role", "==", "coach").limit(1).get();
  console.log("✓ Credentials loaded and Firestore reachable.");

  const coach = coachSnap.docs[0]?.data();
  if (coach) {
    console.log(`✓ Coach account exists: ${coach.email}`);
  } else {
    console.log("✗ No coach account yet - run: npm run create-coach -- <email> <password>");
  }

  console.log(
    "\nNot checkable from here (confirm in the Firebase console):\n" +
      "  - Email/Password sign-in is enabled\n" +
      "  - Firestore security rules are deployed (npm run deploy:rules)"
  );
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("✗ Setup check failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
);
