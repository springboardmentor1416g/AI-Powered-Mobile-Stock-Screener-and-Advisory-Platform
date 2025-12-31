const { Pool } = require("pg");
const logger = require("../utils/logger");

let pool = null;

function initDb() {
  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "stock_screener",
    max: 10,
  });

  pool.on("error", (err) => {
    logger.error({ err }, "Unexpected PG pool error");
  });

  logger.info(
    {
      db: process.env.DB_NAME || "stock_screener",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
    },
    "DB pool initialized"
  );

  return pool;
}

function getPool() {
  if (!pool) throw new Error("DB pool not initialized. Call initDb() first.");
  return pool;
}

module.exports = { initDb, getPool };
