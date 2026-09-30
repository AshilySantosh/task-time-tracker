import express from "express";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Tracker API is running",
  });
});

app.use("/api/auth", authRoutes);

export default app;