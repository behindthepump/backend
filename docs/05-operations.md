# Operations

Everything needed to run, deploy, and maintain the app.

## Local development

```sh
# backend (http://localhost:4100)
cd backend && npm install && npm run dev

# frontend (http://localhost:3000) - needs the backend running
cd frontend && npm install && npm run dev
```

Config:

- `backend/serviceAccount.json` — Firebase service-account key (gitignored).
  Everything backend derives the project from this one file.
- `frontend/.env.local` — Firebase **web app** config + `VITE_API_URL`
  (copy `.env.example`).

## Scripts (backend)

| Script | Does |
|--------|------|
| `npm run dev` / `start` | API with reload / plain (prod runs tsx directly, no build) |
| `npm run create-coach -- <email> <pw>` | Create the coach account + custom claim |
| `npm run seed:foods` | Write/overwrite the `reference/foods` doc. Edit the list in `src/seed-foods.ts`, re-run to update |
| `npm run deploy:rules` | Deploy Firestore **rules + indexes** to the key's project |
| `npm run verify` | Read-only health check: credentials, coach exists, foods seeded |
| `npm run lint` | Typecheck (both repos have this) |

## New Firebase project checklist

Order matters; a fresh project needs all of it:

1. Console: create the project, add a **Web app**, enable **Firestore**.
2. Console: enable sign-in providers — **Email/Password** (coach) and
   **Google** (clients). Check authorized domains include the hosting domain.
3. Swap `backend/serviceAccount.json` (Project settings → Service accounts)
   and `frontend/.env.local` / `.env.production` (web app config).
4. `npm run deploy:rules` — without the composite index the coach roster
   query fails (see Troubleshooting).
5. `npm run create-coach -- <email> <password>`
6. `npm run seed:foods`
7. `npm run verify` to confirm.

## Deployment

- **Backend → Render**: blueprint in `backend/render.yaml` (free plan,
  Singapore). Env vars: `FIREBASE_SERVICE_ACCOUNT_BASE64`
  (`base64 -i serviceAccount.json | tr -d '\n'`) and optionally
  `CORS_ORIGIN` (comma-separated frontend origins). Health check: `/health`.
- **Frontend → Firebase Hosting**: `npm run build`, then
  `npx firebase deploy --only hosting` from `frontend/`.
  `.env.production` (committed — web keys are public identifiers) must point
  `VITE_API_URL` at the Render URL.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Coach dashboard shows "Something went wrong" | Roster query missing its composite index → `npm run deploy:rules`, then wait a few minutes while the index builds |
| First request after idle is very slow | Render free plan cold start; the splash shows an escape hatch after 8s |
| Google sign-in popup fails | Provider not enabled, or domain missing from Auth → authorized domains |
| Food panel says "not available" | `npm run seed:foods` hasn't run on this project |
| CORS errors in the browser | `CORS_ORIGIN` on Render doesn't include the frontend origin |
