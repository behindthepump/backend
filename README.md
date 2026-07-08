# Fitness Tracker — Backend API

Express + TypeScript REST API for the 12-week fitness tracker. Every request is
authenticated with a Firebase ID token; all data lives in Firestore, accessed
through the Firebase Admin SDK. The frontend calls this API — it never touches
Firestore directly.

```
browser ──(Firebase ID token)──▶ this API ──(Admin SDK)──▶ Firestore
```

Layered `routes → controller → service → repository`, with a Bearer-token auth
middleware and a shared `{ success, data, message }` JSON envelope. Endpoints
live under `/v1` (see `src/routes`).

## Configuration

Credentials are read from one of (see `.env.example`):

- **`serviceAccount.json`** — a Firebase service-account key (Project settings →
  Service accounts → Generate new private key). Recommended for local use.
- **`FIREBASE_SERVICE_ACCOUNT_BASE64`** — base64 of the same key JSON, for deploys.

Both are gitignored. The Firestore project is read from the key, so it's the
only thing that changes between environments.

## Setup

```sh
npm install
npm run deploy:rules                          # deploy Firestore rules to the key's project
npm run create-coach -- <email> <password>    # create the coach (admin) account
npm run verify                                 # confirm credentials + coach
npm run dev                                    # API on http://localhost:4100
```

Requires the Firebase project to have **Email/Password sign-in** and **Firestore**
enabled (one-time console setup).

## Endpoints (`/v1`, all require `Authorization: Bearer <id-token>`)

| Method | Path | Who | Purpose |
|--------|------|-----|---------|
| GET | `/me` | any | Session (role, name, forced-change flag) |
| POST | `/me/password` | any | Set new password + clear forced-change |
| GET | `/app-data` | any | Coach → all clients+logs; client → own |
| POST | `/clients` | coach | Create client (Auth + docs + 12-wk plan) |
| DELETE | `/clients/:uid` | coach | Delete Auth account + cascade Firestore |
| PUT | `/clients/:uid/profile` | coach | Update coach-set profile fields |
| PUT | `/clients/:uid/calories/:date` | owner | Save a daily calorie entry |
| PUT | `/clients/:uid/workouts/:key` | owner | Save a workout check-off |

## Scripts

`dev` · `start` · `create-coach` · `deploy:rules` · `verify` · `lint`

## Docs

See `docs/` for the product overview, flow, requirements, and the auth/data model.
