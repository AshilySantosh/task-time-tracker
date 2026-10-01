import { Request, Response } from "express";
import { signup, login } from "../services/auth.service";
import { signupSchema, loginSchema } from "../validators/auth.validator";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../lib/prisma";

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

export const loginController = async (
    req: Request,
    res: Response
  ) => {
    try {
      // 1. Validate request body
      const result = loginSchema.safeParse(req.body);
  
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.issues,
        });
      }
  
      // 2. Authenticate user
      const { token, user } = await login(result.data);
  
      // 3. Store JWT in HTTP-only cookie
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      // 4. Return safe user information
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "INVALID_CREDENTIALS"
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }
  
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };


  export const meController = async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const userId = req.userId;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
  
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };


  export const logoutController = (
    _req: Request,
    res: Response
  ) => {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
  
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  };