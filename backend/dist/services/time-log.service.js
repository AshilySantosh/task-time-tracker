"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskTotalTime = exports.getTaskTimeLogs = exports.getTimeLogs = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getTimeLogs = async (userId) => {
    const timeLogs = await prisma_1.default.timeLog.findMany({
        where: {
            userId,
        },
        include: {
            task: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                },
            },
        },
        orderBy: {
            startedAt: "desc",
        },
    });
    return timeLogs;
};
exports.getTimeLogs = getTimeLogs;
const getTaskTimeLogs = async (taskId, userId) => {
    // Make sure the task belongs to the user
    const task = await prisma_1.default.task.findFirst({
        where: {
            id: taskId,
            userId,
        },
    });
    if (!task) {
        throw new Error("TASK_NOT_FOUND");
    }
    const timeLogs = await prisma_1.default.timeLog.findMany({
        where: {
            taskId,
            userId,
        },
        orderBy: {
            startedAt: "desc",
        },
    });
    return timeLogs;
};
exports.getTaskTimeLogs = getTaskTimeLogs;
const getTaskTotalTime = async (taskId, userId) => {
    const task = await prisma_1.default.task.findFirst({
        where: {
            id: taskId,
            userId,
        },
    });
    if (!task) {
        throw new Error("TASK_NOT_FOUND");
    }
    const result = await prisma_1.default.timeLog.aggregate({
        where: {
            taskId,
            userId,
            duration: {
                not: null,
            },
        },
        _sum: {
            duration: true,
        },
    });
    return result._sum.duration ?? 0;
};
exports.getTaskTotalTime = getTaskTotalTime;
