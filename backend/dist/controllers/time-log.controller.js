"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskTotalTimeController = exports.getTaskTimeLogsController = exports.getTimeLogsController = void 0;
const time_log_service_1 = require("../services/time-log.service");
const getTimeLogsController = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const timeLogs = await (0, time_log_service_1.getTimeLogs)(userId);
        return res.status(200).json({
            success: true,
            data: timeLogs,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getTimeLogsController = getTimeLogsController;
const getTaskTimeLogsController = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const timeLogs = await (0, time_log_service_1.getTaskTimeLogs)(taskId, userId);
        return res.status(200).json({
            success: true,
            data: timeLogs,
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
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getTaskTimeLogsController = getTaskTimeLogsController;
const getTaskTotalTimeController = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const totalSeconds = await (0, time_log_service_1.getTaskTotalTime)(taskId, userId);
        return res.status(200).json({
            success: true,
            data: {
                taskId,
                totalSeconds,
            },
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
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getTaskTotalTimeController = getTaskTotalTimeController;
