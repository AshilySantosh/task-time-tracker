import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getTimeLogs,
  getTaskTimeLogs,
  getTaskTotalTime,
} from "../services/time-log.service";

export const getTimeLogsController = async (
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
  
      const timeLogs = await getTimeLogs(userId);
  
      return res.status(200).json({
        success: true,
        data: timeLogs,
      });
    } catch (error) {
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  export const getTaskTimeLogsController = async (
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
  
      const timeLogs = await getTaskTimeLogs(
        taskId,
        userId
      );
  
      return res.status(200).json({
        success: true,
        data: timeLogs,
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

  export const getTaskTotalTimeController = async (
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
  
      const totalSeconds = await getTaskTotalTime(
        taskId,
        userId
      );
  
      return res.status(200).json({
        success: true,
        data: {
          taskId,
          totalSeconds,
        },
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
  