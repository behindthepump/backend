import { Router } from "express";
import { db } from "../config/firebase.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authMiddleware } from "../middleware/auth.js";
import { NotFound } from "../utils/errors.js";

// Read-only reference data. One Firestore doc (seeded by `npm run
// seed:foods`), served to any signed-in user; the frontend caches it in
// memory for the session. Too small for the controller/service layering.
const router = Router();
router.use(authMiddleware);

router.get(
  "/foods",
  asyncHandler(async (_req, res) => {
    const snap = await db.doc("reference/foods").get();
    if (!snap.exists) throw NotFound("Food reference not available.");
    res.sendSuccess({ data: snap.data() });
  })
);

export default router;
