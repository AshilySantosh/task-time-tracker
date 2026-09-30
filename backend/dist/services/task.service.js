"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const createTask = async (data) => {
    const { userId, title, description, status } = data;
    const task = await prisma_1.default.task.create({
        data: {
            userId,
            title,
            description,
            status,
        },
    });
    return task;
};
exports.createTask = createTask;
const getTasks = async (userId) => {
    const tasks = await prisma_1.default.task.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return tasks;
};
exports.getTasks = getTasks;
const getTaskById = async (taskId, userId) => {
    const task = await prisma_1.default.task.findFirst({
        where: {
            id: taskId,
            userId,
        },
    });
    if (!task) {
        throw new Error("TASK_NOT_FOUND");
    }
    return task;
};
exports.getTaskById = getTaskById;
const updateTask = async (taskId, userId, data) => {
    const existingTask = await prisma_1.default.task.findFirst({
        where: {
            id: taskId,
            userId,
        },
    });
    if (!existingTask) {
        throw new Error("TASK_NOT_FOUND");
    }
    const task = await prisma_1.default.task.update({
        where: {
            id: taskId,
        },
        data,
    });
    return task;
};
exports.updateTask = updateTask;
const deleteTask = async (taskId, userId) => {
    const existingTask = await prisma_1.default.task.findFirst({
        where: {
            id: taskId,
            userId,
        },
    });
    if (!existingTask) {
        throw new Error("TASK_NOT_FOUND");
    }
    await prisma_1.default.task.delete({
        where: {
            id: taskId,
        },
    });
};
exports.deleteTask = deleteTask;
