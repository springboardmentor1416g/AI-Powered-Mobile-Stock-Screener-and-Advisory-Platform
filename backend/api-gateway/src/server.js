const createApp = require("./app");
const { loadEnv } = require("./config/env");
const { initDb } = require("./config/db");
const logger = require("./utils/logger");

const env = loadEnv();

// init DB pool (if DB_PASSWORD missing, you will see error early)
try {
  initDb();
} catch (e) {
  logger.warn({ err: e.message }, "DB pool not initialized (missing env?). Metadata will fallback to mock.");
}

const app = createApp();

const port = Number(process.env.PORT || 8080);

app.listen(port, () => {
  logger.info({ port, env }, "API Gateway started");
});
