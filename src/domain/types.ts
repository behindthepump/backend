// Shared data shapes, mirroring the frontend's types so the API responses
// drop straight into the client's existing state.
// 2-day split uses Lower/Upper; 3-day uses Lower/Push/Pull (see program.ts).
export type WorkoutName = "Lower Body" | "Upper Body" | "Upper Body Push" | "Upper Body Pull";

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
  workout_frequency: 2 | 3; // coach-set workouts per week (set at approval)
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
