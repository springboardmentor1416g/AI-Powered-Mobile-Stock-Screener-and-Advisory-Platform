// backend/api-gateway/src/app.js
const express = require("express");

const trace = require("./middleware/trace");
const errorHandler = require("./middleware/errorHandler");

const healthRoutes = require("./routes/health.routes");
const metadataRoutes = require("./routes/metadata.routes");
const authRoutes = require("./routes/auth.routes");
const screenerRoutes = require("./routes/screener.routes");

function createApp() {
  const app = express();

  // core middleware
  app.use(express.json({ limit: "1mb" }));
  app.use(trace);

  // routes
  app.use("/api/v1/health", healthRoutes);
  app.use("/api/v1/metadata", metadataRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/screener", screenerRoutes);

  // error handler LAST
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
