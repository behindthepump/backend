import { auth } from "../config/firebase.js";
import {
  PROGRAM_WEEKS,
  WORKOUT_DEFINITIONS,
  generateTempPassword,
  workoutKey
} from "../domain/program.js";
import type { User, WorkoutLog } from "../domain/types.js";
import { LogRepository } from "../repository/log.repository.js";
import { ProfileFields, UserRepository } from "../repository/user.repository.js";
import { BadRequest, Conflict, NotFound } from "../utils/errors.js";

export interface NewClientResult {
  user: User;
  workoutLogs: WorkoutLog[];
  tempPassword: string;
}

export class ClientService {
  constructor(
    private users: UserRepository,
    private logs: LogRepository
  ) {}

  listClients = (): Promise<User[]> => this.users.listClients();

  // Create the Auth account (Admin SDK) with a generated temp password, the
  // user doc (forced-change on), and the 12-week plan. If the Firestore
  // writes fail, the Auth account is rolled back so the email isn't burned.
  createClient = async (fields: Omit<User, "id">): Promise<NewClientResult> => {
    if (!fields.email || !/^\S+@\S+\.\S+$/.test(fields.email)) {
      throw BadRequest("A valid email is required.");
    }
    if (!fields.name?.trim()) throw BadRequest("Name is required.");

    if (await this.authUserExists(fields.email)) {
      throw Conflict("That email already has a sign-in account. Use a different email.");
    }

    const tempPassword = generateTempPassword();
    const { uid } = await auth.createUser({ email: fields.email, password: tempPassword });

    try {
      await this.users.createClient(uid, fields);

      const workoutLogs: WorkoutLog[] = [];
      const entries: { key: string; data: Omit<WorkoutLog, "id" | "user_id"> }[] = [];
      for (let week = 1; week <= PROGRAM_WEEKS; week++) {
        for (const def of WORKOUT_DEFINITIONS) {
          const key = workoutKey(week, def.name);
          const data = {
            week,
            workout_name: def.name,
            calories_burned: def.calories,
            completed: false,
            completed_at: null
          };
          entries.push({ key, data });
          workoutLogs.push({ id: `work-${uid}-${key}`, user_id: uid, ...data });
        }
      }
      await this.logs.seedWorkouts(uid, entries);

      return { user: { ...fields, id: uid }, workoutLogs, tempPassword };
    } catch (err) {
      await auth.deleteUser(uid).catch(() => {});
      throw err;
    }
  };

  // Full removal: Firestore data AND the Auth account (fixes the orphan
  // limitation the client-only SDK had).
  deleteClient = async (uid: string): Promise<void> => {
    const client = await this.users.getClient(uid);
    if (!client) throw NotFound("Client not found.");
    await this.logs.deleteAllForUser(uid);
    await this.users.deleteDoc(uid);
    await auth.deleteUser(uid).catch(() => {});
  };

  updateProfile = async (uid: string, fields: ProfileFields): Promise<void> => {
    const client = await this.users.getClient(uid);
    if (!client) throw NotFound("Client not found.");
    await this.users.updateProfile(uid, fields);
  };

  private async authUserExists(email: string): Promise<boolean> {
    try {
      await auth.getUserByEmail(email);
      return true;
    } catch (err) {
      if ((err as { code?: string }).code === "auth/user-not-found") return false;
      throw err;
    }
  }
}
