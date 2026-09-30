import prisma from "../lib/prisma";

export const startTimer = async (
    taskId: string,
    userId: string
  ) => {
    // 1. Verify that the task belongs to the user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });
  
    if (!task) {
      throw new Error("TASK_NOT_FOUND");
    }
  
    // 2. Check if this user already has an active timer
    const activeTimer = await prisma.timeLog.findFirst({
      where: {
        userId,
        endedAt: null,
      },
    });
  
    if (activeTimer) {
      throw new Error("TIMER_ALREADY_RUNNING");
    }
  
    // 3. Create a new time log
    const timeLog = await prisma.timeLog.create({
      data: {
        taskId,
        userId,
        startedAt: new Date(),
      },
    });
  
    // 4. Mark task as in progress
    await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: "IN_PROGRESS",
      },
    });
  
    return timeLog;
  };


  export const stopTimer = async (
    taskId: string,
    userId: string
  ) => {
    // 1. Find the active timer for this task and user
    const activeTimer = await prisma.timeLog.findFirst({
      where: {
        taskId,
        userId,
        endedAt: null,
      },
    });
  
    if (!activeTimer) {
      throw new Error("NO_ACTIVE_TIMER");
    }
  
    // 2. Capture the end time
    const endedAt = new Date();
  
    // 3. Calculate duration in seconds
    const duration = Math.floor(
      (endedAt.getTime() - activeTimer.startedAt.getTime()) / 1000
    );
  
    // 4. Update the time log
    const timeLog = await prisma.timeLog.update({
      where: {
        id: activeTimer.id,
      },
      data: {
        endedAt,
        duration,
      },
    });
  
    // 5. Mark the task as completed
    await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: "IN_PROGRESS",
      },
    });
  
    return timeLog;
  };