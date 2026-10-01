import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import timeLogRoutes from "./routes/time-log.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import cors from "cors";

const app = express();

app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );

app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Tracker API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/time-logs", timeLogRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;