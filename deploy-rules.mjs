// Deploys firestore.rules to the project named in serviceAccount.json, using
// that same key to authenticate. No .firebaserc / --project juggling: swap the
// key file and this targets the new project automatically.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(here, "serviceAccount.json");

let projectId;
try {
  projectId = JSON.parse(readFileSync(keyPath, "utf-8")).project_id;
} catch {
  console.error("Could not read backend/serviceAccount.json - place the key there first.");
  process.exit(1);
}
if (!projectId) {
  console.error("serviceAccount.json has no project_id.");
  process.exit(1);
}

console.log(`Deploying Firestore rules + indexes to "${projectId}"...`);
const res = spawnSync(
  "npx",
  ["firebase", "deploy", "--only", "firestore", "--project", projectId],
  { stdio: "inherit", env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: keyPath } }
);
process.exit(res.status ?? 1);
