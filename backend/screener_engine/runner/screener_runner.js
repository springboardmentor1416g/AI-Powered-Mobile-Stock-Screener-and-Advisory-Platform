const { Pool } = require('pg');
require('dotenv').config();
const { resolveDerivedMetrics } = require('../compiler/derived_metrics_resolver');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run(query) {
  const { sql, params, derivedMetrics = [] } = query;

  // Execute base query
  const baseResults = await pool.query(sql, params);
  
  // If there are derived metrics, resolve them
  if (derivedMetrics && derivedMetrics.length > 0) {
    const filteredResults = await resolveDerivedMetrics(
      baseResults.rows,
      derivedMetrics,
      pool
    );
    return filteredResults;
  }

  return baseResults.rows;
}

module.exports = {
  run
};
