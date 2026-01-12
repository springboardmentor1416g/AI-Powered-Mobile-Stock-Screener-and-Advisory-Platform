// backend/api-gateway/src/server.js
const { createApp } = require("./app");
const logger = require("./utils/logger");
const { initDb, getPool } = require("./config/db");

async function start() {
  try {
    // init DB first
    await initDb();

    const app = createApp();

    // attach pool for controllers/services
    app.locals.db = getPool();

    const port = Number(process.env.PORT || 8080);

    app.listen(port, () => {
      logger.info(
        { port, env: process.env.ENV || "dev" },
        "API Gateway started"
      );
    });
  } catch (err) {
    logger.error({ err }, "Failed to start API Gateway");
    process.exit(1);
  }
}

start();


const screenerRoutes = require("./routes/screener.routes");
app.use("/api/v1/screener", screenerRoutes);
