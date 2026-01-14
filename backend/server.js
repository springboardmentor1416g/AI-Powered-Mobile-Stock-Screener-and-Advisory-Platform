const express = require("express");
const cors = require("cors");
require("dotenv").config();

// 1. Import Routes
const authRoutes = require("./auth/routes/authRoutes");
const authMiddleware = require("./auth/middleware/auth");
const llmParserRoutes = require("./ingestion/routes/llmParserRoutes");
const watchlistRoutes = require("./portfolio/routes/watchlistRoutes");
const portfolioRoutes = require("./portfolio/routes/portfolioRoutes");

// ✅ NEW: Import Market Routes (For live Yahoo Finance data)
const marketRoutes = require("./market/routes/marketRoutes");

const app = express();

app.use(express.json());
app.use(cors());

/* ============================
   PUBLIC ROUTES
============================ */
app.use("/auth", authRoutes);

// LLM Route
app.use("/api/llm", llmParserRoutes);

/* ============================
   USER DATA ROUTES
============================ */

// Watchlist Route
app.use("/api/watchlist", watchlistRoutes);

// Portfolio Route
app.use("/api/portfolio", portfolioRoutes);

/* ============================
   MARKET DATA ROUTES
============================ */
// ✅ Register the Market Route
// This enables: GET http://localhost:4000/api/stocks/AAPL
app.use("/api/stocks", marketRoutes);

/* ============================
   PROTECTED ROUTES
============================ */
app.get("/secure/info", authMiddleware, (req, res) => {
  res.json({
    message: "Secure data",
    user: req.user
  });
});

/* ============================
   HEALTH CHECK
============================ */
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    timestamp: new Date().toISOString()
  });
});

/* ============================
   SERVER START
============================ */
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Node backend running on port ${PORT}`);
  console.log(`Network Access Available via IP!`); 
});