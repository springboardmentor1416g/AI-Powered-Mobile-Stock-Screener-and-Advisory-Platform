const pool = require("../db/client");
const { buildWhereClause } = require("../db/queryBuilder");

async function runScreener(dsl) {
  const { where, values } = buildWhereClause(dsl);

  const query = `
    SELECT symbol, pe, promoter_holding, positive_earnings
    FROM stocks
    ${where};
  `;

  const result = await pool.query(query, values);
  return result.rows;
}

module.exports = { runScreener };

