const compileGroup = require('./logical_compiler');
const guard = require('../validation/execution_guard');

module.exports = function compileDSL(dsl) {
  guard(dsl);

  const compiled = compileGroup(dsl.filter.and);

  const sql = `
    SELECT DISTINCT stocks.symbol, stocks.name
    FROM stocks
    JOIN financials ON stocks.symbol = financials.symbol
    WHERE ${compiled.sql}
  `;

  return {
    sql,
    params: compiled.params
  };
};
