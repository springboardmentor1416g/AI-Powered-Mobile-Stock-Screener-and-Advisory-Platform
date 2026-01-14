const validateDSL = require('../validation');
const compileGroup = require('./logical_compiler');

module.exports = function compileDSL(dsl) {
  validateDSL(dsl);

  if (!dsl.filter || !dsl.filter.and) {
    throw new Error('Only AND filters supported in v1');
  }

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
