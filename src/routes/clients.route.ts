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
const logsController = new LogsController(new LogService(logs));

const router = Router();
router.use(authMiddleware);

// Coach-only roster management.
router.get("/", requireCoach, clients.list);
router.post("/", requireCoach, clients.create);
router.delete("/:uid", requireCoach, clients.remove);
router.put("/:uid/profile", requireCoach, clients.updateProfile);

// Log writes: a client for themselves, the coach for anyone (checked in the service).
router.put("/:uid/calories/:date", logsController.saveCalorie);
router.put("/:uid/workouts/:key", logsController.saveWorkout);

export default router;
