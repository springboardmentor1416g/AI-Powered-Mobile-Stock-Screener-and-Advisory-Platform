const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./auth/routes/authRoutes");
const authMiddleware = require("./auth/middleware/auth");

const app = express();

app.use(express.json());
app.use(cors());

// Public routes
app.use("/auth", authRoutes);

// Protected routes example
app.get("/secure/info", authMiddleware, (req, res) => {
  res.json({ message: "Secure data", user: req.user });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
});

app.listen(process.env.PORT, () => {
  console.log("Node backend running on port", process.env.PORT);
});
