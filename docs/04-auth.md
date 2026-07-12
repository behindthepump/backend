# Auth & Access

Identity is Firebase Auth; authorization is enforced by the backend API on
every request. The data model lives in
[03-architecture](03-architecture.md#data-model-firestore).

## Accounts

| Role | Sign-in | Created by |
|------|---------|-----------|
| Coach | Email + password | `npm run create-coach -- <email> <password>` — stamps a `role: coach` custom claim. No in-app signup. |
| Client | Google only | Self-signup from the login screen |

Any verified token **without** the coach claim is a client. Only the coach
has a password; "Forgot password" on the login screen sends Firebase's reset
email (silently, so it never reveals which emails exist).

## Client lifecycle

A client's `status` field drives everything they can see:

```
(no user doc)          "new"       → onboarding form
POST /me/onboarding →  pending     → waitlist screen
coach approves      →  active      → the tracker
coach declines      →  declined    → waitlist screen (declined copy);
                                     approval still possible later
coach deletes       →  (gone)      → next Google sign-in starts over at "new"
```

`GET /v1/me` builds the session from the verified token (role) and the user
doc (name, status).

## Who can do what

| Action | Coach | Client |
|--------|-------|--------|
| Read all clients, requests, any client's logs | ✓ | – |
| Approve / decline / delete clients | ✓ | – |
| Edit any client's profile (metrics, BMR, split) | ✓ | – |
| Write calorie / workout logs | – | own only |
| Read own data | ✓ | ✓ |
| Food reference | ✓ | ✓ |

Log writes are deliberately **owner-only** — the coach monitors read-only
and influences the plan through the profile, never the logs.

## Firestore rules

`firestore.rules` denies **all** direct reads and writes. Every access path
goes through the API (Admin SDK, which bypasses rules); the rules exist only
to close the direct-access surface, since the web API key is public and
clients hold real Firebase sessions. Deploy with `npm run deploy:rules`
(see [05-operations](05-operations.md#scripts)).
