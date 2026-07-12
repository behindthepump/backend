import type { AppData } from "../domain/types.js";
import { LogRepository } from "../repository/log.repository.js";
import { UserRepository } from "../repository/user.repository.js";

export class AppDataService {
  constructor(
    private users: UserRepository,
    private logs: LogRepository
  ) {}

  // The signed-in client's own bootstrap load. The coach's roster uses the
  // paginated GET /v1/clients instead. A missing/non-client doc means the
  // account was deleted - return nothing and let the UI show the inactive
  // screen.
  getAppData = async (userId: string): Promise<AppData> => {
    const user = await this.users.getClient(userId);
    if (!user) return { users: [], dailyCalories: [], workoutLogs: [] };

    const [dailyCalories, workoutLogs] = await Promise.all([
      this.logs.getCalories(userId),
      this.logs.getWorkouts(userId)
    ]);
    return { users: [user], dailyCalories, workoutLogs };
  };
}
