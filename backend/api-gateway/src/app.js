const express = require("express");
const traceMiddleware = require("./middleware/trace");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const healthRoutes = require("./routes/health.routes");
const metadataRoutes = require("./routes/metadata.routes");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(traceMiddleware);

  // API versioning
  app.use("/api/v1", healthRoutes);
  app.use("/api/v1", metadataRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
