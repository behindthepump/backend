import { asyncHandler } from "../middleware/async-handler.js";
import { AccountService } from "../service/account.service.js";
import { SessionService } from "../service/session.service.js";

export class MeController {
  constructor(
    private sessions: SessionService,
    private accounts: AccountService
  ) {}

  getSession = asyncHandler(async (req, res) => {
    const data = await this.sessions.buildSession(req.userId, req.role);
    res.sendSuccess({ data });
  });

  changePassword = asyncHandler(async (req, res) => {
    await this.accounts.changePassword(req.userId, req.body?.newPassword);
    res.sendSuccess({ message: "Password updated." });
  });
}
