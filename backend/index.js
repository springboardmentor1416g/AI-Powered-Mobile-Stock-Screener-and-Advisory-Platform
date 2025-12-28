const express = require("express");
const path = require("path");

// 1. Load environment variables
// (This path assumes .env is in the same folder as index.js, or one level up)
require("dotenv").config(); 

// 2. Import Database (Optional, just to ensure connection starts)
const pool = require("./config/db"); 

// 3. Import Routes
const llmParserRoute = require("./ingestion/routes/llmParserRoute");
// const authRoutes = require("./auth/routes/authRoutes"); 

const app = express();

// 4. Middleware (CRITICAL for receiving JSON)
app.use(express.json()); 

// 5. Register Routes
app.use("/llm", llmParserRoute);
// app.use("/auth", authRoutes); 

// 6. Basic Health Check
app.get("/", (req, res) => {
  res.send("Stock Screener Backend is Running!");
});

// 7. Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});