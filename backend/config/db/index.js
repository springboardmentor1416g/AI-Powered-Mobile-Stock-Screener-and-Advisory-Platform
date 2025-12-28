const { Pool } = require("pg");
const path = require("path");

// Load .env from backend root (../../.env relative to this file)
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

console.log("Debug connection:");
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);
console.log("Password Type:", typeof process.env.DB_PASSWORD);

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

module.exports = pool;