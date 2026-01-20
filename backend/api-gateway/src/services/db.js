const { Pool } = require("pg");
const { logger } = require("../utils/logger");

let pool;

function initDb(cfg) {
  if (!cfg.DB_PASSWORD) {
    logger.warn("DB_PASSWORD is empty. DB queries may fail.");
  }

  pool = new Pool({
    host: cfg.DB_HOST,
    port: cfg.DB_PORT,
    database: cfg.DB_NAME,
    user: cfg.DB_USER,
    password: cfg.DB_PASSWORD,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  pool.on("error", (err) => logger.error({ err }, "Unexpected PG pool error"));

  logger.info(
    { db: cfg.DB_NAME, host: cfg.DB_HOST, port: cfg.DB_PORT },
    "DB pool initialized"
  );

  return pool;
}

function getPool() {
  if (!pool) throw new Error("DB pool not initialized. Call initDb() first.");
  return pool;
}

module.exports = { initDb, getPool };