# Flows

Step-by-step journeys for both roles. Program rules and math live in
[01-product](01-product.md); how sign-in and approval work under the hood is
in [04-auth](04-auth.md).

## Client: joining

1. Press **Continue with Google** on the login screen (first sign-in creates
   the account).
2. Fill the **onboarding** form: name, age, gender, height, current weight,
   target weight. BMR is computed automatically.
3. Wait on the **waitlist screen** until the coach approves. A declined
   request shows different copy but can still be approved later.
4. On approval, the tracker opens at the coach-chosen start date.

## Client: day to day

- **Daily Tracking** — pick a day on the week calendar, enter calories eaten
  (notes optional). The **food reference panel** below lists common Malaysian
  foods; tapping **+** on a food adds its calories to the day's count. Future
  days are locked; past days can be edited.
- **Workout Tracking** — all five sets (2-day + 3-day groups) are listed
  every week; tap any to check it off. The burn field comes prefilled from
  BMR (editable). Tap again to uncheck — any week. A **Personal Workout
  Routine** entry takes one self-calculated weekly total + notes. Each set
  expands to show its Gym/Home exercise routine.
- **Dashboard / Progress** — current week, estimated weight, deficit totals,
  week-by-week breakdown, and the trend toward the target.

## Coach: requests

The dashboard's **Requests** panel lists signups (name, goal with the weekly
pace it implies, details on demand):

- **Approve** — pick the program start date (snapped to that week's
  Monday). The client becomes active immediately.
- **Decline** — the request stays listed with a Declined badge and can be
  approved later.

## Coach: monitoring

- **Roster** — paginated, name-searchable list of active clients. Each card
  answers three questions: where are they (week), are they progressing (goal
  bar: kg lost vs their target), and are they active right now (recency chip
  + this week's workouts/logged days).
- **Client Report** — opening a client shows the monitoring view: KPIs, a
  12-week compliance grid (every day and workout at a glance; hover any cell
  for detail), the weight trend, and the client's food-log notes.
- **Profile tab** — the only place the coach writes: name, metrics, BMR
  override, weekly split. Log entries are owner-only — the coach never edits
  a client's logs.
- **Delete** — removes the client's data and sign-in; they can sign up again
  from scratch.
