"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
const signupController = async (req, res) => {
    try {
        // 1. Validate request body
        const result = auth_validator_1.signupSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues,
            });
        }
        // 2. Call service
        const user = await (0, auth_service_1.signup)(result.data);
        // 3. Return created user
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    }
    catch (error) {
        // Duplicate email
        if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.signupController = signupController;
