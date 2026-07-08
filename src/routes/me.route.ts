import { Router } from "express";
import { MeController } from "../controller/me.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { UserRepository } from "../repository/user.repository.js";
import { AccountService } from "../service/account.service.js";
import { SessionService } from "../service/session.service.js";

const users = new UserRepository();
const controller = new MeController(new SessionService(users), new AccountService(users));

const router = Router();
router.use(authMiddleware);
router.get("/", controller.getSession);
router.post("/password", controller.changePassword);

export default router;
