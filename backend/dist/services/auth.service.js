"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const signup = async (data) => {
    const { name, email, password } = data;
    // 1. Check if user already exists
    const existingUser = await prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }
    // 2. Hash password
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    // 3. Create user
    const user = await prisma_1.default.user.create({
        data: {
            name,
            email,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });
    return user;
};
exports.signup = signup;
