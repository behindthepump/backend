import { asyncHandler } from "../middleware/async-handler.js";
import { LogService } from "../service/log.service.js";

export class LogsController {
  constructor(private logs: LogService) {}

  saveCalorie = asyncHandler(async (req, res) => {
    await this.logs.saveCalorie(
      req.userId,
      req.role,
      req.params.uid!,
      req.params.date!,
      req.body ?? {}
    );
    res.sendSuccess({ message: "Saved." });
  });

  saveWorkout = asyncHandler(async (req, res) => {
    await this.logs.saveWorkout(
      req.userId,
      req.role,
      req.params.uid!,
      req.params.key!,
      req.body ?? {}
    );
    res.sendSuccess({ message: "Saved." });
  });
}
