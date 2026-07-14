import { ALL_WORKOUT_NAMES, MAX_WORKOUT_CALORIES } from "../domain/program.js";
import { getWeekForDate } from "../domain/stats.js";
import type { WorkoutName } from "../domain/types.js";
import { LogRepository } from "../repository/log.repository.js";
import { UserRepository } from "../repository/user.repository.js";
import { BadRequest, Forbidden } from "../utils/errors.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WORKOUT_KEY_RE = /^w\d{1,2}_[a-z0-9-]+$/;

export class LogService {
  constructor(private logs: LogRepository, private users: UserRepository) {}

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

    // The server clock is UTC and clients may be ahead of it (Malaysia is
    // UTC+8), so "future" gets a one-day grace window instead of false
    // rejections around midnight. Past days are freely editable - the
    // client holds themselves accountable.
    const utcTomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    if (date > utcTomorrow) throw BadRequest("That day hasn't happened yet.");

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
    if (typeof body.workout_name !== "string" || !ALL_WORKOUT_NAMES.has(body.workout_name)) {
      throw BadRequest("Unknown workout name.");
    }
    // Burn calories are self-reported by the client at check-off.
    const calories_burned = Number(body.calories_burned);
    if (!Number.isFinite(calories_burned) || calories_burned < 0 || calories_burned > MAX_WORKOUT_CALORIES) {
      throw BadRequest(`calories_burned must be between 0 and ${MAX_WORKOUT_CALORIES}.`);
    }
    const completed = body.completed === true;
    const completed_at = typeof body.completed_at === "string" ? body.completed_at : null;
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 500) : "";

    // Past weeks are freely editable; only future weeks are blocked. UTC
    // "now" with the client-favouring grace of allowing one week ahead
    // (ahead-of-UTC timezones never get blocked early).
    const userDoc = await this.users.getDoc(uid);
    const startDate = typeof userDoc?.program_start_date === "string" ? userDoc.program_start_date : "";
    if (startDate) {
      const utcToday = new Date().toISOString().slice(0, 10);
      const currentWeek = getWeekForDate(utcToday, startDate);
      if (week > currentWeek + 1) throw BadRequest("Future weeks unlock as you reach them.");
    }

    await this.logs.setWorkout(uid, key, {
      week,
      workout_name: body.workout_name as WorkoutName,
      calories_burned,
      completed,
      completed_at,
      notes
    });
  };
}
