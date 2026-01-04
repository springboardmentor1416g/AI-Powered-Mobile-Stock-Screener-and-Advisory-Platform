const { Pool } = require("pg");

const pool = new Pool({
<<<<<<< HEAD
  connectionString: process.env.DB_URL
=======
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "123456789",
  database: process.env.DB_NAME || "stock_screener",
  port: 5432,
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
});

module.exports = pool;
