import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createTaskController,
  getTasksController,
  getTaskController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/task.controller";

import {
    startTimerController,
    stopTimerController,
  } from "../controllers/timer.controller";

  import {
    getTaskTimeLogsController,
    getTaskTotalTimeController,
  } from "../controllers/time-log.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createTaskController);
router.get("/", getTasksController);
router.get("/:id", getTaskController);
router.patch("/:id", updateTaskController);
router.delete("/:id", deleteTaskController);

router.post("/:id/start", startTimerController);
router.post("/:id/stop", stopTimerController);

router.get("/:id/time-logs", getTaskTimeLogsController);
router.get("/:id/time", getTaskTotalTimeController);

export default router;