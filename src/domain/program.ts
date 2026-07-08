import { randomBytes } from "node:crypto";
import type { WorkoutName } from "./types.js";

// The fixed 12-week program: three workouts per week with set burn values.
export const WORKOUT_DEFINITIONS: { name: WorkoutName; calories: number }[] = [
  { name: "Lower Body", calories: 210 },
  { name: "Upper Body Push", calories: 262.5 },
  { name: "Upper Body Pull", calories: 210 }
];

export const PROGRAM_WEEKS = 12;

// Deterministic doc id for a workout: e.g. "w3_upper-body-push".
export function workoutKey(week: number, workoutName: string): string {
  return `w${week}_${workoutName.toLowerCase().replace(/\s+/g, "-")}`;
}

// Random temporary password: unambiguous characters, 12 long.
export function generateTempPassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
