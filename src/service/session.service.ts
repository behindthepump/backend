import type { Session } from "../domain/types.js";
import { UserRepository } from "../repository/user.repository.js";

export class SessionService {
  constructor(private users: UserRepository) {}

  // Role comes from the verified token claim; name + forced-change flag
  // come from the user doc.
  buildSession = async (userId: string, role: "coach" | "client"): Promise<Session> => {
    const data = await this.users.getDoc(userId);
    return {
      userId,
      role,
      name: typeof data?.name === "string" ? data.name : "User",
      mustChangePassword: data?.must_change_password === true
    };
  };
}
