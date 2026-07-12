# Architecture

```
browser (React SPA) ──(Firebase ID token)──▶ Express API ──(Admin SDK)──▶ Firestore
     Firebase Hosting                      Render (Singapore)          asia-south2
```

Two repos: `frontend/` (React 19 + Vite + Tailwind 4) and `backend/`
(Express + TypeScript, run with tsx — no build step). Firebase Auth handles
identity only; **the browser never touches Firestore**. Security rules deny
all direct access (see [04-auth](04-auth.md#firestore-rules)).

## Backend layout

`routes → controller → service → repository`, one folder each under
`backend/src/`. Supporting pieces:

- `middleware/auth.ts` — verifies the Bearer token, sets `userId`/`role`/`email`.
- `middleware/response-formatter.ts` — every response is
  `{ success, data, message }`; errors are `{ success: false, message }`.
- `utils/errors.ts` — typed `HttpError`s; 5xx never leak internals.
- `domain/` — pure logic: program constants, BMR/Monday helpers, roster stats.

## Data model (Firestore)

```
users/{uid}                  role, status (pending|active|declined), email,
                             name, name_lower, name_prefixes[], age, gender,
                             height, starting_weight, target_weight, bmr,
                             program_start_date, workout_frequency (2|3),
                             requested_at        (profile fields absent for coach)
users/{uid}/calories/{date}  calories, notes            doc id = YYYY-MM-DD
users/{uid}/workouts/{key}   week, workout_name, calories_burned (client-entered),
                             completed, completed_at    key = w{week}_{slug}
reference/foods              disclaimer, categories[{name, items[{name, calories}]}]
```

Doc IDs are semantic (date, workout key), so every write is an idempotent
upsert. **Workout docs are written on check-off, never pre-seeded** — the UI
derives each week's slots from `workout_frequency` and treats a missing doc
as unchecked.

## API

All under `/v1`, all requiring `Authorization: Bearer <id-token>`:

| Method | Path | Who | Purpose |
|--------|------|-----|---------|
| GET | `/me` | any | Session: role, name, status |
| POST | `/me/onboarding` | new client | Create own pending user doc (computed BMR) |
| GET | `/app-data` | client | Own profile + logs, one bootstrap load |
| GET | `/clients?search=&cursor=&limit=` | coach | Roster page + per-client stats |
| GET | `/clients/requests` | coach | Pending + declined signups |
| GET | `/clients/:uid/data` | coach | One client's profile + full logs |
| POST | `/clients/:uid/approve` | coach | Start program (Monday date + split) |
| POST | `/clients/:uid/decline` | coach | Decline (reversible) |
| DELETE | `/clients/:uid` | coach | Delete data + Auth account |
| PUT | `/clients/:uid/profile` | coach | Update profile (incl. BMR, split) |
| PUT | `/clients/:uid/calories/:date` | owner | Upsert a daily calorie entry |
| PUT | `/clients/:uid/workouts/:key` | owner | Upsert a workout check-off |
| GET | `/reference/foods` | any | Food calorie reference |

## Scale design (500+ clients)

The coach's roster is **cursor-paginated** (ordered by `name_lower`) and
**word-prefix searched**: every name write stores `name_prefixes` (each
prefix of each word, so "kum" finds "Jatin Kumar") and search filters with
`array-contains` on the last token typed. Both composite indexes live in
`firestore.indexes.json`. Per-page stats are computed server-side
(`domain/stats.ts`) from each client's logs; the drill-in fetches one
client's full logs on demand. Nothing coach-side is bulk-loaded.

## Where logic lives

| Logic | Lives in | Note |
|-------|----------|------|
| Input validation (ranges, ownership) | Backend services | The real gate |
| UX validation (future dates, week locks) | Frontend (`data.ts`, handlers) | Friendlier errors, faster feedback |
| Deficit/weight math for the client's own view | Frontend `data.ts` | Full logs are already in the browser |
| Roster stats | Backend `domain/stats.ts` | Mirrors the same math, per [01-product](01-product.md#the-math) |
| Exercise routines, workout slots | Static code (`routines.ts`, `WORKOUT_SLOTS`) | Mirrored in both repos |
| Food reference | Firestore `reference/foods` | Fetched once per session, cached in memory |

## Frontend state

`App.tsx` owns the session and, for a signed-in client, their own data (one
`/app-data` load; writes go API-first, then mirror into local state).
`CoachView` owns all coach data: roster pages, requests, and drill-in — each
fetched on demand and refreshed after mutations. Coach and client screens
are separate component trees composed from shared primitives; read-only vs
interactive is expressed by omitting handlers, never by role flags.
