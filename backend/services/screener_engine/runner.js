const pool = require("../../db");


const { compileFilter } = require("./compiler");

async function runScreener(dsl) {
  const params = [];
  const whereClause = compileFilter(dsl.filter, params);

  const query = `
    SELECT ticker
    FROM fundamentals
    WHERE ${whereClause};
  `;

  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = { runScreener };
