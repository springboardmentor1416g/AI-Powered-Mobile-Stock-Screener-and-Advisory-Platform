const pool = require("../config/db");
const { compileDSL } = require("./compiler");

async function runScreener(dsl) {
  const { whereClause, values } = compileDSL(dsl);

  const query = `
    SELECT symbol, company_name
    FROM metrics_normalized
    WHERE ${whereClause}
  `;

  const result = await pool.query(query, values);
  return result.rows;
}

module.exports = { runScreener };
