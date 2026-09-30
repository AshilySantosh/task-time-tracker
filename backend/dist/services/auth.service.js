"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const login = async (data) => {
    const { email, password } = data;
    // 1. Find user
    const user = await prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }
    // 2. Compare password with stored hash
    const passwordMatches = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!passwordMatches) {
        throw new Error("INVALID_CREDENTIALS");
    }
    // 3. Generate JWT
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
    }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    // 4. Return safe user data + token
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
};
exports.login = login;
