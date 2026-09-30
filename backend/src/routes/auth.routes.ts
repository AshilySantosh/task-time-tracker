import { Router } from "express";
import { signupController, loginController, meController, logoutController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/me", authMiddleware, meController);
router.post("/logout", authMiddleware, logoutController);

export default router;