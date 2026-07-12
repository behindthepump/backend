# Fitness Tracker — Backend API

Express + TypeScript REST API for the 12-week fitness tracker. Verifies a
Firebase ID token on every request and owns all Firestore access via the
Admin SDK — the browser never touches the database.

```
browser ──(Firebase ID token)──▶ this API ──(Admin SDK)──▶ Firestore
```

## Quickstart

```sh
npm install
npm run dev        # http://localhost:4100 (needs backend/serviceAccount.json)
```

First time on a fresh Firebase project? Follow the
[new-project checklist](docs/05-operations.md#new-firebase-project-checklist).

## Documentation

Start at **[docs/](docs/README.md)** — product, flows,
[architecture + API reference](docs/03-architecture.md#api),
[auth model](docs/04-auth.md), and
[operations](docs/05-operations.md) (scripts, deploys, troubleshooting).
