"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaskController = exports.updateTaskController = exports.getTaskController = exports.getTasksController = exports.createTaskController = void 0;
const task_service_1 = require("../services/task.service");
const task_validator_1 = require("../validators/task.validator");
const createTaskController = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const result = task_validator_1.createTaskSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues,
            });
        }
        const task = await (0, task_service_1.createTask)({
            userId,
            ...result.data,
        });
        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task,
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
exports.createTaskController = createTaskController;
const getTasksController = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const tasks = await (0, task_service_1.getTasks)(userId);
        return res.status(200).json({
            success: true,
            data: tasks,
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
exports.getTasksController = getTasksController;
const getTaskController = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const task = await (0, task_service_1.getTaskById)(taskId, userId);
        return res.status(200).json({
            success: true,
            data: task,
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
exports.getTaskController = getTaskController;
const updateTaskController = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const result = task_validator_1.updateTaskSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues,
            });
        }
        const task = await (0, task_service_1.updateTask)(taskId, userId, result.data);
        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: task,
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
exports.updateTaskController = updateTaskController;
const deleteTaskController = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        await (0, task_service_1.deleteTask)(taskId, userId);
        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
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
exports.deleteTaskController = deleteTaskController;
