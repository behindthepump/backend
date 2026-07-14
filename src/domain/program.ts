// Every checkable workout: all five coach sets (both splits are always
// offered) plus the client's free-form "Personal" weekly entry. Burn
// calories are entered by the client at check-off, not fixed here.
export const ALL_WORKOUT_NAMES = new Set<string>([
  "Lower Body",
  "Upper Body",
  "Lower Body (3-Day)",
  "Upper Body Push",
  "Upper Body Pull",
  "Personal"
]);

export const MAX_WORKOUT_CALORIES = 3000;

export const PROGRAM_WEEKS = 12;

// Monday of the week containing the given YYYY-MM-DD date (Week 1 anchor).
export function mondayOf(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  const day = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Mifflin-St Jeor BMR from the onboarding profile. "Other" gender uses the
// midpoint of the male/female constants. Coach can override via profile edit.
export function computeBmr(fields: {
  gender: string;
  height: number; // cm
  starting_weight: number; // kg
  age: number;
}): number {
  const base = 10 * fields.starting_weight + 6.25 * fields.height - 5 * fields.age;
  const offset = fields.gender === "Male" ? 5 : fields.gender === "Female" ? -161 : -78;
  return Math.round(base + offset);
}
