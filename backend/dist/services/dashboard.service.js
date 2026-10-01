"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklySummary = exports.getDailySummary = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const getDailySummary = async (userId) => {
    const now = new Date();
    // Start of today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    // Start of tomorrow
    const startOfTomorrow = new Date(startOfDay);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    // Get today's time logs
    const timeLogs = await prisma_1.default.timeLog.findMany({
        where: {
            userId,
            startedAt: {
                gte: startOfDay,
                lt: startOfTomorrow,
            },
        },
        include: {
            task: true,
        },
    });
    // Calculate total tracked seconds
    const totalTrackedSeconds = timeLogs.reduce((total, log) => total + (log.duration ?? 0), 0);
    // Unique tasks worked on today
    const uniqueTaskIds = new Set(timeLogs.map((log) => log.taskId));
    // Get all user's tasks
    const tasks = await prisma_1.default.task.findMany({
        where: {
            userId,
        },
    });
    const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
    const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
    const pendingTasks = tasks.filter((task) => task.status === "PENDING");
    return {
        date: startOfDay.toISOString().split("T")[0],
        tasksWorkedOn: uniqueTaskIds.size,
        totalTrackedSeconds,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        pendingTasks: pendingTasks.length,
    };
};
exports.getDailySummary = getDailySummary;
const getWeeklySummary = async (userId) => {
    const now = new Date();
    // Monday 00:00:00
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    // Next Monday 00:00:00
    const startOfNextWeek = new Date(startOfWeek);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
    const timeLogs = await prisma_1.default.timeLog.findMany({
        where: {
            userId,
            startedAt: {
                gte: startOfWeek,
                lt: startOfNextWeek,
            },
        },
    });
    const totalTrackedSeconds = timeLogs.reduce((total, log) => total + (log.duration ?? 0), 0);
    const uniqueTaskIds = new Set(timeLogs.map((log) => log.taskId));
    const tasks = await prisma_1.default.task.findMany({
        where: {
            userId,
        },
    });
    const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
    const dailyData = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        const dayLogs = timeLogs.filter((log) => log.startedAt >= date &&
            log.startedAt < nextDate);
        const trackedSeconds = dayLogs.reduce((total, log) => total + (log.duration ?? 0), 0);
        return {
            date: formatLocalDate(date),
            day: date.toLocaleDateString("en-US", {
                weekday: "short",
            }),
            trackedSeconds,
        };
    });
    return {
        weekStart: formatLocalDate(startOfWeek),
        totalTrackedSeconds,
        tasksWorkedOn: uniqueTaskIds.size,
        completedTasks: completedTasks.length,
        dailyData,
    };
};
exports.getWeeklySummary = getWeeklySummary;
