// Shared data shapes, mirroring the frontend's types so the API responses
// drop straight into the client's existing state.
// All five coach sets are always available; the two Lower Body days are
// distinct routines. "Personal" is the client's own free-form weekly entry.
export type WorkoutName =
  | "Lower Body"
  | "Upper Body"
  | "Lower Body (3-Day)"
  | "Upper Body Push"
  | "Upper Body Pull"
  | "Personal";

// Lifecycle of a self-signed-up client: pending until the coach approves.
export type UserStatus = "pending" | "active" | "declined";

export interface User {
  id: string; // Firebase uid
  email: string;
  name: string;
  age: number;
  gender: string;
  height: number; // cm, client-entered at onboarding (drives BMR)
  starting_weight: number;
  target_weight: number;
  bmr: number;
  program_start_date: string; // YYYY-MM-DD, Monday of Week 1 (set at approval)
  status: UserStatus;
  requested_at?: string; // ISO timestamp of the signup request
  approved_at?: string; // YYYY-MM-DD the coach approved (first loggable day)
}

export interface DailyCalorie {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  calories: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  week: number;
  workout_name: WorkoutName;
  calories_burned: number;
  completed: boolean;
  completed_at: string | null;
  notes?: string; // "Personal" entries: what the client did that week
}

export interface AppData {
  users: User[];
  dailyCalories: DailyCalorie[];
  workoutLogs: WorkoutLog[];
}

export interface Session {
  userId: string;
  role: "coach" | "client";
  name: string;
  // "new" = authed but no user doc yet (signup before onboarding)
  status: UserStatus | "new";
}
