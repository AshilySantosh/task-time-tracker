import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/task.service";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../validators/task.validator";


export const createTaskController = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
  
      const result = createTaskSchema.safeParse(req.body);
  
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.issues,
        });
      }
  
      const task = await createTask({
        userId,
        ...result.data,
      });
  
      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };


  export const getTasksController = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
  
      const tasks = await getTasks(userId);
  
      return res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  export const getTaskController = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
      const taskId = req.params.id as string;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
  
      const task = await getTaskById(taskId, userId);
  
      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "TASK_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
  
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  export const updateTaskController = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
      const taskId = req.params.id as string;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
  
      const result = updateTaskSchema.safeParse(req.body);
  
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.issues,
        });
      }
  
      const task = await updateTask(
        taskId,
        userId,
        result.data
      );
  
      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "TASK_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
  
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  export const deleteTaskController = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
      const taskId = req.params.id as string;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
  
      await deleteTask(taskId, userId);
  
      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "TASK_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
  
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };