# Product Flow

## Entering the app

- A user signs in with **email + password** as either a **coach** or a **client** — the role comes from their account, not from a switch in the UI (see `04-auth.md`).
- A coach lands on the coach dashboard. A client lands on their own dashboard.
- A client signing in with a coach-issued temporary password must set their own password before anything else.
- Clients never see the coach view or other clients' data.

## Coach flow

1. **Create client** — enter name, email, age, gender, starting weight, target weight, BMR, and program start date. The system generates a temporary password and shows the email + password pair once, with a one-button copy.
2. On creation, the client's 12-week plan is generated automatically (3 workouts × 12 weeks, all incomplete).
3. **Monitor** — the coach dashboard lists every client with:
   - current week (e.g., Week 5 of 12)
   - total calorie deficit and estimated weight lost
   - workout completion (e.g., 15 / 36)
   - missed logging days (gaps)
4. Coach can open any client's detailed view, send them a password-reset email, or delete a client (removes all their data).

## Client flow (daily)

1. Open **Daily Tracking** and enter calories eaten for today (notes optional).
2. The day's deficit is computed immediately: `BMR − calories eaten`.
3. Past days can be edited; **future days cannot be logged**.

## Client flow (weekly)

1. Open **Workout Tracking** and check off workouts as they are completed.
2. A completed workout is stamped with the real completion date and adds its calories to the week's deficit.
3. Only the current week and past weeks can be toggled — future weeks are locked.

## Client flow (progress)

1. **Dashboard** shows current week, current (estimated) weight, total deficit, and workout completion.
2. **Progress** shows week-by-week deficit and estimated weight loss, and trajectory toward the target weight.

## Time rules

- "Today" is always the real current date — never hardcoded.
- Week number = derived from the client's start date and today, clamped to 1–12.
- Before the start date the program is "not started"; after week 12 it is "completed".
