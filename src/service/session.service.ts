import type { Session } from "../domain/types.js";
import { UserRepository } from "../repository/user.repository.js";

export class SessionService {
  constructor(private users: UserRepository) {}

  // Role comes from the verified token claim; name + status from the user
  // doc. No doc yet means a fresh Google signup that still needs onboarding.
  buildSession = async (userId: string, role: "coach" | "client"): Promise<Session> => {
    const data = await this.users.getDoc(userId);
    const status = !data
      ? "new"
      : data.status === "pending" || data.status === "declined"
        ? data.status
        : "active";
    return {
      userId,
      role,
      name: typeof data?.name === "string" ? data.name : "User",
      status
    };
  };
}
