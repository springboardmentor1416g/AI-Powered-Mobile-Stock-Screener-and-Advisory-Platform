const { Pool } = require('pg');
require('dotenv').config();
const { resolveDerivedMetrics } = require('../compiler/derived_metrics_resolver');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run(query) {
  const { sql, params, derivedMetrics = [] } = query;

  try {
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
  } catch (error) {
    // Log the actual error for debugging
    console.error('Screener runner error:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

module.exports = {
  run
};
