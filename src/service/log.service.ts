import { LogRepository } from "../repository/log.repository.js";
import { BadRequest, Forbidden } from "../utils/errors.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WORKOUT_KEY_RE = /^w\d{1,2}_[a-z-]+$/;

export class LogService {
  constructor(private logs: LogRepository) {}

  // Daily logs belong to the client. Only the owner may write them - not
  // even the coach, who monitors read-only (the coach edits profiles, not logs).
  private assertCanWrite(callerId: string, _callerRole: string, uid: string): void {
    if (callerId !== uid) {
      throw Forbidden("Daily logs can only be edited by the client who owns them.");
    }
  }

  saveCalorie = async (
    callerId: string,
    callerRole: string,
    uid: string,
    date: string,
    body: { calories?: unknown; notes?: unknown }
  ): Promise<void> => {
    this.assertCanWrite(callerId, callerRole, uid);
    if (!DATE_RE.test(date)) throw BadRequest("Date must be YYYY-MM-DD.");

    const calories = Number(body.calories);
    if (!Number.isFinite(calories) || calories < 0 || calories > 10000) {
      throw BadRequest("Calories must be between 0 and 10000.");
    }
    const notes = typeof body.notes === "string" ? body.notes : "";
    await this.logs.setCalorie(uid, date, { calories, notes });
  };

  saveWorkout = async (
    callerId: string,
    callerRole: string,
    uid: string,
    key: string,
    body: Record<string, unknown>
  ): Promise<void> => {
    this.assertCanWrite(callerId, callerRole, uid);
    if (!WORKOUT_KEY_RE.test(key)) throw BadRequest("Invalid workout key.");

    const week = Number(body.week);
    if (!Number.isInteger(week) || week < 1 || week > 12) throw BadRequest("Week must be 1-12.");
    if (typeof body.workout_name !== "string") throw BadRequest("workout_name is required.");
    const calories_burned = Number(body.calories_burned);
    if (!Number.isFinite(calories_burned)) throw BadRequest("calories_burned must be a number.");
    const completed = body.completed === true;
    const completed_at = typeof body.completed_at === "string" ? body.completed_at : null;

    await this.logs.setWorkout(uid, key, {
      week,
      workout_name: body.workout_name as never,
      calories_burned,
      completed,
      completed_at
    });
  };
}
