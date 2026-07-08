# Authentication & Data (Firebase)

Both roles sign in with **email + password** via **Firebase Auth**. All app data lives in
**Firestore**. There is no custom server — privileged setup runs as a local script with the
Firebase Admin SDK, and access control is enforced by **Firestore security rules**.

## Accounts

- **Coach**: exactly one account, created offline by a script — `npm run create-coach -- <email> <password>` in `backend/`. The script also stamps a `role: coach` custom claim on the account. There is no in-app coach signup.
- **Client**: created by the coach in the app.

## Client onboarding flow

1. Coach starts a program for a new client by entering their **email** (plus the existing profile fields).
2. The app **auto-generates a temporary password** and creates the client's Auth account (via a secondary Firebase app instance, so the coach stays signed in).
3. The email + password pair is shown to the coach **once**, with a single copy button that copies the pair together.
4. Coach shares the pair with the client (outside the app).
5. Client signs in with the pair and is **forced to a change-password screen** (a `must_change_password` flag on their Firestore user doc) — the app is unreachable until the password is changed.
6. After changing it, the client uses the app normally.

## Password reset

- If a client forgets their password, the coach presses **Reset password** on the client's card (or the client uses "Forgot password" on the login screen).
- Either path sends **Firebase's built-in password-reset email** to the client. No temp-password regeneration — resets go through the client's inbox.

## Access control (Firestore security rules)

- The coach is identified by the `role: coach` custom claim.
- **Coach**: read/write all client docs and logs; only the coach can create/delete client docs and edit profiles.
- **Client**: read own docs; write own calorie/workout logs; the only profile field a client can change is clearing their own `must_change_password` flag.
- Data-shape rules (no future-dated logs, program bounds, value ranges) are validated in the app; the rules enforce **who** can touch **what**.

## Data model (Firestore)

```
users/{uid}                  role, email, name, must_change_password,
                             age, gender, starting_weight, target_weight,
                             bmr, program_start_date   (profile fields absent for coach)
users/{uid}/calories/{date}  calories, notes            (doc id = YYYY-MM-DD)
users/{uid}/workouts/{key}   week, workout_name, calories_burned,
                             completed, completed_at    (key = w{week}_{workout})
```

## Known limitations

- Deleting a client removes all their Firestore data, but their Auth account can only be
  deleted with the Admin SDK. The orphaned account can sign in but the rules deny it all
  data (the app shows "account no longer active").
- Because the orphaned Auth account survives, a deleted client's **email cannot be reused**
  for a new client from the app. Free it by deleting the Auth user in the Firebase console
  (Authentication → Users) or with the Admin SDK.

## Local development

- The app runs against the **Firebase Emulator Suite** (Auth + Firestore) locally — no real
  project needed until deployment. Real project config goes in `frontend/.env.local`.
