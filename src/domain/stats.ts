import type { DailyCalorie, User, WorkoutLog } from "./types.js";
import { PROGRAM_WEEKS } from "./program.js";

// Server-side port of the roster-card stats the coach dashboard shows per
// client (the client's own richer view still computes in the browser from
// raw logs). "Today" is the server's date - a few hours' skew from the
// coach's timezone is fine for roster-level numbers.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function todayStr(): string {
  return formatDate(new Date());
}

function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// Raw program week for a date relative to a start date (can be <1 or >12).
// Rounded day-diff absorbs DST offsets.
export function getWeekForDate(dateStr: string, startDateStr: string): number {
  const diffDays = Math.round(
    (parseDate(dateStr).getTime() - parseDate(startDateStr).getTime()) / MS_PER_DAY
  );
  return Math.floor(diffDays / 7) + 1;
}

export type ProgramStatus = "not_started" | "active" | "completed";

// Only what the roster card actually displays: where the client is, how
// they're tracking toward their goal, and whether they're active right now.
export interface ClientStats {
  program_status: ProgramStatus;
  current_week: number; // clamped 1..12
  total_weight_lost: number; // kg estimate (deficit / 7700, floored per week)
  last_logged: string | null; // latest calorie date or workout check-off
  week_workouts_completed: number; // in the current program week
  week_days_logged: number; // calorie logs in the current program week so far
}

export function computeClientStats(
  user: User,
  calories: DailyCalorie[],
  workouts: WorkoutLog[]
): ClientStats {
  const today = todayStr();
  const rawWeek = getWeekForDate(today, user.program_start_date);
  const program_status: ProgramStatus =
    rawWeek < 1 ? "not_started" : rawWeek > PROGRAM_WEEKS ? "completed" : "active";
  const current_week = Math.max(1, Math.min(PROGRAM_WEEKS, rawWeek));

  const completed = workouts.filter((w) => w.completed);
  const caloriesByDate = new Map(calories.map((c) => [c.date, c.calories]));

  const activityDates = [
    ...calories.map((c) => c.date),
    ...completed.filter((w) => w.completed_at).map((w) => w.completed_at as string)
  ];
  const last_logged = activityDates.length > 0 ? activityDates.sort().pop()! : null;

  // Weekly deficit = sum(BMR - eaten, logged days) + completed workout burn;
  // weight lost = deficit / 7700, never negative. Totals accumulate up to
  // the current week (mirrors the frontend math).
  let total_weight_lost = 0;
  if (program_status !== "not_started") {
    for (let week = 1; week <= current_week; week++) {
      const weekStart = addDays(user.program_start_date, (week - 1) * 7);
      let deficit = 0;
      for (let i = 0; i < 7; i++) {
        const eaten = caloriesByDate.get(addDays(weekStart, i));
        if (eaten !== undefined) deficit += user.bmr - eaten;
      }
      deficit += completed
        .filter((w) => w.week === week)
        .reduce((sum, w) => sum + w.calories_burned, 0);
      if (deficit > 0) total_weight_lost += parseFloat((deficit / 7700).toFixed(2));
    }
  }

  // Current-week activity (the "are they moving right now" signal).
  let week_workouts_completed = 0;
  let week_days_logged = 0;
  if (program_status === "active") {
    week_workouts_completed = completed.filter((w) => w.week === current_week).length;
    const weekStart = addDays(user.program_start_date, (current_week - 1) * 7);
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      if (d > today) break;
      if (caloriesByDate.has(d)) week_days_logged++;
    }
  }

  return {
    program_status,
    current_week,
    total_weight_lost: parseFloat(total_weight_lost.toFixed(2)),
    last_logged,
    week_workouts_completed,
    week_days_logged
  };
}
