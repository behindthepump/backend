import { Router } from "express";
import { ClientsController } from "../controller/clients.controller.js";
import { LogsController } from "../controller/logs.controller.js";
import { authMiddleware, requireCoach } from "../middleware/auth.js";
import { LogRepository } from "../repository/log.repository.js";
import { UserRepository } from "../repository/user.repository.js";
import { ClientService } from "../service/client.service.js";
import { LogService } from "../service/log.service.js";

const users = new UserRepository();
const logs = new LogRepository();
const clients = new ClientsController(new ClientService(users, logs));
const logsController = new LogsController(new LogService(logs, users));

const router = Router();
router.use(authMiddleware);

// Coach-only roster management. Clients are created by self-signup
// (POST /v1/me/onboarding); the coach approves or declines the request.
// GET / is paginated (?search=&cursor=&limit=) with per-client stats.
router.get("/", requireCoach, clients.list);
router.get("/requests", requireCoach, clients.listRequests);
router.get("/:uid/data", requireCoach, clients.getData);
router.post("/:uid/approve", requireCoach, clients.approve);
router.post("/:uid/decline", requireCoach, clients.decline);
router.delete("/:uid", requireCoach, clients.remove);
router.put("/:uid/profile", requireCoach, clients.updateProfile);

// Log writes: owner-only - even the coach monitors read-only.
router.put("/:uid/calories/:date", logsController.saveCalorie);
router.put("/:uid/workouts/:key", logsController.saveWorkout);

export default router;
