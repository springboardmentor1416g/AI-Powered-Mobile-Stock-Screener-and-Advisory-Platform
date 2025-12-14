const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "123456789",
  database: process.env.DB_NAME || "stock_screener",
  port: 5432,
});

module.exports = pool;
