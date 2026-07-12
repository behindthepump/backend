import { asyncHandler } from "../middleware/async-handler.js";
import { AppDataService } from "../service/app-data.service.js";

export class AppDataController {
  constructor(private appData: AppDataService) {}

  get = asyncHandler(async (req, res) => {
    const data = await this.appData.getAppData(req.userId);
    res.sendSuccess({ data });
  });
}
