"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopTimerController = exports.startTimerController = void 0;
const timer_service_1 = require("../services/timer.service");
const startTimerController = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const timeLog = await (0, timer_service_1.startTimer)(taskId, userId);
        return res.status(201).json({
            success: true,
            message: "Timer started successfully",
            data: timeLog,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "TASK_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }
        if (error instanceof Error &&
            error.message === "TIMER_ALREADY_RUNNING") {
            return res.status(409).json({
                success: false,
                message: "Another timer is already running",
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.startTimerController = startTimerController;
const stopTimerController = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const timeLog = await (0, timer_service_1.stopTimer)(taskId, userId);
        return res.status(200).json({
            success: true,
            message: "Timer stopped successfully",
            data: timeLog,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message === "NO_ACTIVE_TIMER") {
            return res.status(404).json({
                success: false,
                message: "No active timer found for this task",
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.stopTimerController = stopTimerController;
