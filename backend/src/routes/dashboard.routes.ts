import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getDailySummaryController, getWeeklySummaryController } from "../controllers/dashboard.controller";

const router = Router();

router.use(authMiddleware);

router.get("/daily-summary", getDailySummaryController);
router.get(
    "/weekly-summary",
    getWeeklySummaryController
  );
  
export default router;