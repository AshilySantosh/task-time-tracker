import prisma from "../lib/prisma";

interface CreateTaskData {
  userId: string;
  title: string;
  description?: string;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export const createTask = async (data: CreateTaskData) => {
    const { userId, title, description, status } = data;
  
    const task = await prisma.task.create({
      data: {
        userId,
        title,
        description,
        status,
      },
    });
  
    return task;
  };


  export const getTasks = async (userId: string) => {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  
    return tasks;
  };


  export const getTaskById = async (
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
  
    return task;
  };

  export const updateTask = async (
    taskId: string,
    userId: string,
    data: UpdateTaskData
  ) => {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });
  
    if (!existingTask) {
      throw new Error("TASK_NOT_FOUND");
    }
  
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data,
    });
  
    return task;
  };


  export const deleteTask = async (
    taskId: string,
    userId: string
  ) => {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });
  
    if (!existingTask) {
      throw new Error("TASK_NOT_FOUND");
    }
  
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  };