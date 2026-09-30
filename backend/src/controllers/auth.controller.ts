import { Request, Response } from "express";
import { signup } from "../services/auth.service";
import { signupSchema } from "../validators/auth.validator";

export const signupController = async (
  req: Request,
  res: Response
) => {
  try {
    // 1. Validate request body
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    // 2. Call service
    const user = await signup(result.data);

    // 3. Return created user
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
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