"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must not exceed 200 characters")
        .trim(),
    description: zod_1.z
        .string()
        .max(2000, "Description must not exceed 2000 characters")
        .trim()
        .optional(),
    status: zod_1.z
        .enum(["PENDING", "IN_PROGRESS", "COMPLETED"])
        .optional(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must not exceed 200 characters")
        .trim()
        .optional(),
    description: zod_1.z
        .string()
        .max(2000, "Description must not exceed 2000 characters")
        .trim()
        .nullable()
        .optional(),
    status: zod_1.z
        .enum(["PENDING", "IN_PROGRESS", "COMPLETED"])
        .optional(),
});
