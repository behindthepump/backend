import { db } from "../config/firebase.js";
import type { DailyCalorie, WorkoutLog, WorkoutName } from "../domain/types.js";

// calories and workouts are subcollections of each user document:
//   users/{uid}/calories/{date}   users/{uid}/workouts/{key}
export class LogRepository {
  private user(uid: string) {
    return db.collection("users").doc(uid);
  }

  async getCalories(uid: string): Promise<DailyCalorie[]> {
    const snap = await this.user(uid).collection("calories").get();
    return snap.docs.map((d) => ({
      id: `cal-${uid}-${d.id}`,
      user_id: uid,
      date: d.id,
      calories: d.data().calories ?? 0,
      notes: d.data().notes || undefined
    }));
  }

  async getWorkouts(uid: string): Promise<WorkoutLog[]> {
    const snap = await this.user(uid).collection("workouts").get();
    return snap.docs.map((d) => ({
      id: `work-${uid}-${d.id}`,
      user_id: uid,
      week: d.data().week ?? 0,
      workout_name: d.data().workout_name as WorkoutName,
      calories_burned: d.data().calories_burned ?? 0,
      completed: d.data().completed === true,
      completed_at: d.data().completed_at ?? null
    }));
  }

  async setCalorie(
    uid: string,
    date: string,
    data: { calories: number; notes: string }
  ): Promise<void> {
    await this.user(uid).collection("calories").doc(date).set(data);
  }

  async hasCalorie(uid: string, date: string): Promise<boolean> {
    const snap = await this.user(uid).collection("calories").doc(date).get();
    return snap.exists;
  }

  async isWorkoutCompleted(uid: string, key: string): Promise<boolean> {
    const snap = await this.user(uid).collection("workouts").doc(key).get();
    return snap.exists && snap.data()?.completed === true;
  }

  async setWorkout(
    uid: string,
    key: string,
    data: Omit<WorkoutLog, "id" | "user_id">
  ): Promise<void> {
    await this.user(uid).collection("workouts").doc(key).set(data);
  }

  // Delete every calorie + workout doc for a user (client-removal cascade).
  async deleteAllForUser(uid: string): Promise<void> {
    const [calories, workouts] = await Promise.all([
      this.user(uid).collection("calories").get(),
      this.user(uid).collection("workouts").get()
    ]);
    const batch = db.batch();
    calories.docs.forEach((d) => batch.delete(d.ref));
    workouts.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
