import { auth } from "../config/firebase.js";
import { UserRepository } from "../repository/user.repository.js";
import { BadRequest } from "../utils/errors.js";

export class AccountService {
  constructor(private users: UserRepository) {}

  // Sets a new password (Admin SDK, no re-auth needed) and clears the
  // forced-change flag in one step.
  changePassword = async (uid: string, newPassword: unknown): Promise<void> => {
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      throw BadRequest("Password must be at least 8 characters.");
    }
    await auth.updateUser(uid, { password: newPassword });
    await this.users.clearMustChangePassword(uid);
  };
}
