const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Auth Routes (Ensure these files exist in backend/auth/...)
const authRoutes = require("./auth/routes/authRoutes");
const authMiddleware = require("./auth/middleware/auth");

// ✅ CORRECTED PATH: Points to where we created the file
const llmParserRoutes = require("./ingestion/routes/llmParserRoutes");

const app = express();

app.use(express.json());
app.use(cors());

/* ============================
   PUBLIC ROUTES
============================ */
app.use("/auth", authRoutes);
app.use("/auth", require("./auth/routes/authRoutes"));

// LLM Route
// In Postman, use: POST http://localhost:4000/api/llm/parse
app.use("/api/llm", llmParserRoutes);

// Add this line near your other routes
app.use("/api/portfolio", require("./portfolio/routes/portfolioRoutes"));

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

// CHANGE IS HERE: Add "0.0.0.0" as the second argument
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Node backend running on port ${PORT}`);
  console.log(`Network Access Available via IP!`); 
});