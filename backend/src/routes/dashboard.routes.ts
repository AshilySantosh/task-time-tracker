import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getDailySummaryController } from "../controllers/dashboard.controller";

const router = Router();

router.use(authMiddleware);

router.get("/daily-summary", getDailySummaryController);

export default router;