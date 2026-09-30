"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z
        .string()
        .email("Invalid email address")
        .transform((value) => value.toLowerCase().trim()),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters"),
});
