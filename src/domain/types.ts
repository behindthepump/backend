// Shared data shapes, mirroring the frontend's types so the API responses
// drop straight into the client's existing state.
export type WorkoutName = "Lower Body" | "Upper Body Push" | "Upper Body Pull";

export interface User {
  id: string; // Firebase uid
  email: string;
  name: string;
  age: number;
  gender: string;
  starting_weight: number;
  target_weight: number;
  bmr: number;
  program_start_date: string; // YYYY-MM-DD, Monday of Week 1
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
  mustChangePassword: boolean;
}
