# Requirements

## Functional

### Clients
- R1. Coach can create a client with: name, email (their sign-in), age, gender, starting weight (kg), target weight (kg), BMR (kcal), program start date.
- R2. Each client has an independent 12-week program anchored to their own start date.
- R3. Coach can delete a client; all of that client's data is removed.

### Daily calorie logging
- R4. A client can log one calorie entry per day (with optional note).
- R5. Entries for today and past days can be added or edited; future dates are rejected.
- R6. An unlogged day contributes **zero** to the deficit and is shown as a gap.

### Workouts
- R7. Each week has exactly 3 workouts: Lower Body (210 kcal), Upper Body Push (262.5 kcal), Upper Body Pull (210 kcal).
- R8. A workout can be toggled complete/incomplete for the current or past weeks only.
- R9. Completion is stamped with the real date it was toggled.

### Calculations
- R10. Daily deficit = `BMR − calories eaten` (logged days only).
- R11. Weekly deficit = `sum of daily deficits + calories burned from completed workouts that week`.
- R12. Estimated weight lost = `cumulative deficit ÷ 7700` (kg). Negative deficits do not add weight loss.
- R13. Estimated current weight = `starting weight − total estimated weight lost`.
- R14. Totals accumulate from week 1 up to the client's current week.

### Access & views
- R15. A user is either a coach or a client, determined by login — not by an in-app switch. There is no free toggle between the two views.
  - Authentication is email + password via Firebase Auth — see `04-auth.md` (coach created by script, clients onboarded with auto-generated temporary passwords, mandatory first-login password change, reset via Firebase email).
- R16. Client sees only their own data: Dashboard, Daily Tracking, Workout Tracking, Progress, Profile. A client cannot open another client's data or the coach view.
- R17. Coach sees all clients with per-client: current week, deficit, estimated weight lost, workout completion, logging gaps.

## Non-functional
- R18. Works on mobile and desktop.
- R19. All app data lives in Firestore; a user sees their data from any device. Permission rules are enforced by Firestore security rules, not only the UI.
- R20. No seeded demo data in production builds; app starts empty with a coach onboarding a first client.
