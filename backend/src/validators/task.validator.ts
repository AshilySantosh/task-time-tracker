import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters")
    .trim(),

  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .trim()
    .optional(),

  status: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED"])
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters")
    .trim()
    .optional(),

  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .trim()
    .nullable()
    .optional(),

  status: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED"])
    .optional(),
});