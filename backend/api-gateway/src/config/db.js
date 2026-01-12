// backend/api-gateway/src/config/db.js
const { Pool } = require("pg");
const logger = require("../utils/logger");

let pool;

async function initDb() {
  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "stock_screener",
    max: 10,
  });

  await pool.query("SELECT 1;");
  logger.info(
    { db: process.env.DB_NAME || "stock_screener", host: process.env.DB_HOST || "localhost", port: Number(process.env.DB_PORT || 5432) },
    "DB pool initialized"
  );
}

function getPool() {
  if (!pool) throw new Error("DB pool not initialized");
  return pool;
}

module.exports = { initDb, getPool };
