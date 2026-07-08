import { Router } from "express";
import { AppDataController } from "../controller/app-data.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { LogRepository } from "../repository/log.repository.js";
import { UserRepository } from "../repository/user.repository.js";
import { AppDataService } from "../service/app-data.service.js";

const controller = new AppDataController(
  new AppDataService(new UserRepository(), new LogRepository())
);

const router = Router();
router.use(authMiddleware);
router.get("/", controller.get);

export default router;
