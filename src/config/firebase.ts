import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin credentials, resolved in this order:
//   1. FIREBASE_SERVICE_ACCOUNT_BASE64 env (base64-encoded key JSON) - for deploys
//   2. backend/serviceAccount.json (gitignored)                     - for local use
// Swap either one when moving to the client's real project; nothing else changes.
function loadServiceAccount(): ServiceAccount {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
  }
  const keyPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../serviceAccount.json");
  try {
    return JSON.parse(readFileSync(keyPath, "utf-8"));
  } catch {
    throw new Error(
      "No Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT_BASE64, or place the " +
        "service-account key at backend/serviceAccount.json (see backend/.env.example)."
    );
  }
}

const app = initializeApp({
  credential: cert(loadServiceAccount()),
  // If unset, the project is resolved from the credentials.
  ...(process.env.FIREBASE_PROJECT_ID ? { projectId: process.env.FIREBASE_PROJECT_ID } : {})
});

export const auth = getAuth(app);
export const db = getFirestore(app);
