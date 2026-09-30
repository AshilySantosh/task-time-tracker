import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createTaskController,
  getTasksController,
  getTaskController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/task.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createTaskController);
router.get("/", getTasksController);
router.get("/:id", getTaskController);
router.patch("/:id", updateTaskController);
router.delete("/:id", deleteTaskController);

export default router;