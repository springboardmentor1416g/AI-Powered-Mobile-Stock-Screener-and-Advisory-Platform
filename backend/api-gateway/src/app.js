import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.ENVIRONMENT || "dev"}`
});

// Import Routes
import authRoutes from "./routes/auth.js";
import watchlistRoutes from "./routes/watchlist.js";

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// ----------- Health Check Route -----------
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "OK",
    environment: process.env.ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
});

// ----------- Main API Routes -----------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);

// ----------- Global Error Handler -----------
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error"
  });
});

export default app;
