const validateDSL = require('../validation');
const compileGroup = require('./logical_compiler');

module.exports = function compileDSL(dsl) {
  validateDSL(dsl);

  const filter = dsl.filter || dsl;
  
  if (!filter) {
    throw new Error('DSL must contain a filter');
  }

  // Determine the root logical operator
  let rootConditions;
  let rootJoiner = 'AND';
  
  if (filter.and) {
    rootConditions = filter.and;
    rootJoiner = 'AND';
  } else if (filter.or) {
    rootConditions = filter.or;
    rootJoiner = 'OR';
  } else if (filter.not) {
    // NOT wraps a single condition or group
    rootConditions = [filter];
    rootJoiner = 'AND';
  } else {
    // Single condition
    rootConditions = [filter];
    rootJoiner = 'AND';
  }

  const compiled = compileGroup(rootConditions, rootJoiner);

  // Build base SQL query
  // Note: For derived metrics, we'll need to fetch base data first
  let sql = `
    SELECT DISTINCT 
      stocks.ticker as symbol, 
      stocks.name,
      stocks.ticker
  `;

  // Add base fields needed for derived metrics
  if (compiled.derivedMetrics && compiled.derivedMetrics.length > 0) {
    // We'll need to fetch base metrics for derived metric computation
    // This will be handled in the runner
  }

  sql += `
    FROM companies stocks
    LEFT JOIN fundamentals_quarterly financials ON stocks.ticker = financials.ticker
      AND financials.period_end = (
        SELECT MAX(period_end) 
        FROM fundamentals_quarterly 
        WHERE ticker = stocks.ticker
      )
  `;

  // Only add WHERE clause if there are non-derived conditions
  if (compiled.sql && compiled.sql !== '1=1') {
    sql += ` WHERE ${compiled.sql}`;
  }

  return {
    sql,
    params: compiled.params,
    derivedMetrics: compiled.derivedMetrics || []
  };
};
