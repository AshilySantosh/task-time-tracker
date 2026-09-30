import prisma from "../lib/prisma";

export const getTimeLogs = async (userId: string) => {
    const timeLogs = await prisma.timeLog.findMany({
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

  export const getTaskTimeLogs = async (
    taskId: string,
    userId: string
  ) => {
    // Make sure the task belongs to the user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });
  
    if (!task) {
      throw new Error("TASK_NOT_FOUND");
    }
  
    const timeLogs = await prisma.timeLog.findMany({
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

  export const getTaskTotalTime = async (
    taskId: string,
    userId: string
  ) => {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });
  
    if (!task) {
      throw new Error("TASK_NOT_FOUND");
    }
  
    const result = await prisma.timeLog.aggregate({
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

  