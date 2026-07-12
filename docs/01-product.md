# Product

A 12-week weight-loss tracker for one gym trainer (the **coach**) and their
**clients**. Clients sign up themselves; the coach approves each one, which
starts that client's personal 12-week program. Clients log daily calories and
weekly workouts; the app turns those logs into a calorie deficit and an
estimated weight loss, and the coach monitors everyone from one dashboard.

## Roles

| Role | Does |
|------|------|
| Coach | Approves/declines signups, sets start date + weekly split, monitors all clients, edits profiles |
| Client | Logs daily calories, checks off workouts (entering calories burned), views own progress |

There is exactly one coach. A user is one role or the other, decided by their
sign-in — never a switch in the UI. See [04-auth](04-auth.md).

## The program

- **12 weeks**, anchored to each client's own start date — always a Monday,
  chosen by the coach at approval.
- The current week number is always derived from the real date:
  `floor(days since start ÷ 7) + 1`, clamped to 1–12 for display. Before the
  start date the program is **not started**; past week 12 it is **completed**.
- Each week has workout **slots** from the coach-chosen split (changeable
  later; past weeks keep whatever was logged):

| Split | Slots per week |
|-------|----------------|
| 2-day | Lower Body, Upper Body |
| 3-day | Lower Body, Upper Body Push, Upper Body Pull |

- Every slot has reference exercise routines in **Gym** and **Home** variants.
  These are display-only — the client flips a toggle in the UI; nothing is
  saved.

## The math

All derived numbers come from these rules (single source of truth — code
mirrors this section):

1. **Daily deficit** = `BMR − calories eaten`. Only logged days count; an
   unlogged day contributes zero and shows as a gap.
2. **Weekly deficit** = sum of that week's daily deficits **+** the
   client-entered burn calories of that week's completed workouts.
3. **Estimated weight lost** = `weekly deficit ÷ 7700` kg per week, never
   negative (a bad week doesn't add weight).
4. **Estimated current weight** = starting weight − total estimated loss.
5. Totals accumulate from week 1 up to the current week only.
6. **BMR** is computed at signup (Mifflin-St Jeor, from height, weight, age,
   gender); the coach can override it any time.

## Input limits

| Input | Rule |
|-------|------|
| Daily calories | 0–10,000 kcal, one entry per day, today or past only |
| Workout burn | 0–3,000 kcal, entered by the client at check-off |
| Workout weeks | Current or past weeks only; future weeks are locked |
| Profile metrics | Age 1–120, height 50–250 cm, target weight below starting |

Validation is enforced server-side; the UI checks first for friendlier
errors. See [03-architecture](03-architecture.md#where-logic-lives).
