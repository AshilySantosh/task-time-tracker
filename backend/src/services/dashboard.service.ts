import prisma from "../lib/prisma";

export const getDailySummary = async (userId: string) => {
  const now = new Date();

  // Start of today
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // Start of tomorrow
  const startOfTomorrow = new Date(startOfDay);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  // Get today's time logs
  const timeLogs = await prisma.timeLog.findMany({
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
  const totalTrackedSeconds = timeLogs.reduce(
    (total, log) => total + (log.duration ?? 0),
    0
  );

  // Unique tasks worked on today
  const uniqueTaskIds = new Set(
    timeLogs.map((log) => log.taskId)
  );

  // Get all user's tasks
  const tasks = await prisma.task.findMany({
    where: {
      userId,
    },
  });

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED"
  );

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  );

  const pendingTasks = tasks.filter(
    (task) => task.status === "PENDING"
  );

  return {
    date: startOfDay.toISOString().split("T")[0],

    tasksWorkedOn: uniqueTaskIds.size,

    totalTrackedSeconds,

    completedTasks: completedTasks.length,

    inProgressTasks: inProgressTasks.length,

    pendingTasks: pendingTasks.length,
  };
};