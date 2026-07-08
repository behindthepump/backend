import type { AppData } from "../domain/types.js";
import { LogRepository } from "../repository/log.repository.js";
import { UserRepository } from "../repository/user.repository.js";

export class AppDataService {
  constructor(
    private users: UserRepository,
    private logs: LogRepository
  ) {}

  // Coach gets every client and their logs; a client gets only their own.
  getAppData = async (userId: string, role: "coach" | "client"): Promise<AppData> => {
    if (role === "coach") {
      const users = await this.users.listClients();
      const perUser = await Promise.all(
        users.map(async (u) => ({
          calories: await this.logs.getCalories(u.id),
          workouts: await this.logs.getWorkouts(u.id)
        }))
      );
      return {
        users,
        dailyCalories: perUser.flatMap((p) => p.calories),
        workoutLogs: perUser.flatMap((p) => p.workouts)
      };
    }

    // Client: own doc only. A missing/non-client doc means the account was
    // deleted - return nothing and let the UI show the inactive screen.
    const user = await this.users.getClient(userId);
    if (!user) return { users: [], dailyCalories: [], workoutLogs: [] };

    const [dailyCalories, workoutLogs] = await Promise.all([
      this.logs.getCalories(userId),
      this.logs.getWorkouts(userId)
    ]);
    return { users: [user], dailyCalories, workoutLogs };
  };
}
