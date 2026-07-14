import { auth } from "../config/firebase.js";
import { computeBmr, mondayOf } from "../domain/program.js";
import { ClientStats, computeClientStats } from "../domain/stats.js";
import type { DailyCalorie, User, WorkoutLog } from "../domain/types.js";
import { LogRepository } from "../repository/log.repository.js";
import { ProfileFields, UserRepository } from "../repository/user.repository.js";
import { BadRequest, Conflict, NotFound } from "../utils/errors.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type OnboardingFields = Pick<
  User,
  "name" | "age" | "gender" | "height" | "starting_weight" | "target_weight"
>;

// Shared sanity limits for client metrics (onboarding + coach profile edits).
function metricsError(f: {
  age: number;
  height: number;
  starting_weight: number;
  target_weight: number;
}): string | null {
  if (!Number.isFinite(f.age) || f.age < 1 || f.age > 120) return "Age must be between 1 and 120.";
  if (!Number.isFinite(f.height) || f.height < 50 || f.height > 250) {
    return "Height must be between 50 and 250 cm.";
  }
  if (!Number.isFinite(f.starting_weight) || f.starting_weight <= 0) {
    return "Starting weight must be greater than 0.";
  }
  if (!Number.isFinite(f.target_weight) || f.target_weight <= 0) {
    return "Target weight must be greater than 0.";
  }
  if (f.target_weight >= f.starting_weight) return "Target weight must be below starting weight.";
  return null;
}

export interface ClientPage {
  clients: { user: User; stats: ClientStats }[];
  nextCursor: string | null;
}

export interface ClientData {
  user: User;
  dailyCalories: DailyCalorie[];
  workoutLogs: WorkoutLog[];
}

const MAX_PAGE_SIZE = 50;

export class ClientService {
  constructor(
    private users: UserRepository,
    private logs: LogRepository
  ) {}

  // One roster page with server-computed stat summaries (the coach's list
  // never bulk-loads every client's logs).
  listPage = async (opts: {
    search?: unknown;
    cursor?: unknown;
    limit?: unknown;
  }): Promise<ClientPage> => {
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(opts.limit) || 20));
    const { users, nextCursor } = await this.users.listActiveClientsPage({
      search: typeof opts.search === "string" ? opts.search : "",
      cursor: typeof opts.cursor === "string" && opts.cursor ? opts.cursor : null,
      limit
    });

    const clients = await Promise.all(
      users.map(async (user) => {
        const [calories, workouts] = await Promise.all([
          this.logs.getCalories(user.id),
          this.logs.getWorkouts(user.id)
        ]);
        return { user, stats: computeClientStats(user, calories, workouts) };
      })
    );
    return { clients, nextCursor };
  };

  listRequests = (): Promise<User[]> => this.users.listRequests();

  // Drill-in: one client's profile + full logs.
  getClientData = async (uid: string): Promise<ClientData> => {
    const user = await this.users.getClient(uid);
    if (!user) throw NotFound("Client not found.");
    const [dailyCalories, workoutLogs] = await Promise.all([
      this.logs.getCalories(uid),
      this.logs.getWorkouts(uid)
    ]);
    return { user, dailyCalories, workoutLogs };
  };

  // Self-signup onboarding: creates the caller's own pending user doc with a
  // computed BMR. The coach approves it from the requests table.
  onboard = async (uid: string, email: string, fields: OnboardingFields): Promise<void> => {
    if (!fields.name?.trim()) throw BadRequest("Name is required.");
    const error = metricsError(fields);
    if (error) throw BadRequest(error);
    if (await this.users.getDoc(uid)) throw Conflict("Account already onboarded.");

    await this.users.createPendingClient(uid, {
      email,
      name: fields.name.trim(),
      age: fields.age,
      gender: fields.gender,
      height: fields.height,
      starting_weight: fields.starting_weight,
      target_weight: fields.target_weight,
      bmr: computeBmr(fields)
    });
  };

  // Coach accepts a request: sets the program start date (anchored to its
  // Monday). Declined clients can be approved later - the request stays in
  // the table.
  approve = async (
    uid: string,
    body: { program_start_date?: unknown }
  ): Promise<{ program_start_date: string }> => {
    const client = await this.users.getClient(uid);
    if (!client) throw NotFound("Client not found.");
    if (client.status === "active") throw Conflict("Client is already active.");

    const date = String(body.program_start_date ?? "");
    if (!DATE_RE.test(date)) throw BadRequest("program_start_date must be YYYY-MM-DD.");

    const monday = mondayOf(date);
    await this.users.activate(uid, monday);
    return { program_start_date: monday };
  };

  decline = async (uid: string): Promise<void> => {
    const client = await this.users.getClient(uid);
    if (!client) throw NotFound("Client not found.");
    if (client.status === "active") throw Conflict("Client is already active.");
    await this.users.setDeclined(uid);
  };

  // Full removal: Firestore data AND the Auth account. The person can sign
  // up again with Google if they return.
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
    if (!fields.name?.trim()) throw BadRequest("Name is required.");
    const error = metricsError(fields);
    if (error) throw BadRequest(error);
    if (!Number.isFinite(fields.bmr) || fields.bmr <= 0) throw BadRequest("BMR must be greater than 0.");
    await this.users.updateProfile(uid, { ...fields, name: fields.name.trim() });
  };
}
