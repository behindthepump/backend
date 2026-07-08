import { Router } from "express";
import appDataRouter from "./app-data.route.js";
import clientsRouter from "./clients.route.js";
import meRouter from "./me.route.js";

const router = Router();
router.use("/me", meRouter);
router.use("/app-data", appDataRouter);
router.use("/clients", clientsRouter);

export default router;
