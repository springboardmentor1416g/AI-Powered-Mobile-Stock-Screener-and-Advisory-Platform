// backend/api-gateway/src/app.js
const express = require("express");

const { traceMiddleware } = require("./middleware/trace");
const { errorHandler } = require("./middleware/error");
const healthRoutes = require("./routes/health.routes");
const metadataRoutes = require("./routes/metadata.routes");
const authRoutes = require("./routes/auth.routes");
const screenerRoutes = require("./routes/screener.routes");
const nlScreenerRoutes = require("./routes/nlScreener.routes");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(traceMiddleware);

  app.use("/api/v1/health", healthRoutes);
  app.use("/api/v1/metadata", metadataRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/screener", screenerRoutes);

  // error handler MUST be last
  app.use(errorHandler);

  return app;
}
app.use("/api/v1/nl-screener", nlScreenerRoutes);

module.exports = { createApp };

