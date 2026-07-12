import { Router } from "express";
import { MeController } from "../controller/me.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { LogRepository } from "../repository/log.repository.js";
import { UserRepository } from "../repository/user.repository.js";
import { ClientService } from "../service/client.service.js";
import { SessionService } from "../service/session.service.js";

const users = new UserRepository();
const controller = new MeController(
  new SessionService(users),
  new ClientService(users, new LogRepository())
);

const router = Router();
router.use(authMiddleware);
router.get("/", controller.getSession);
router.post("/onboarding", controller.onboard);

export default router;
