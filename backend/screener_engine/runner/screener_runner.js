const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run(query) {
  const { sql, params } = query;

  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = {
  run
};
