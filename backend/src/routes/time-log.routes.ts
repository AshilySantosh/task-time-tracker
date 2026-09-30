import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getTimeLogsController,
} from "../controllers/time-log.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getTimeLogsController);

export default router;