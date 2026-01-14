const fieldMap = require('./field_mapper');
const derivedMetrics = require('../derived_metrics');

/**
 * Compiles a single condition into SQL
 * Supports: basic operators, range, window, trend, derived metrics
 */
module.exports = function compileCondition(condition, paramIndex) {
  const { field, operator, value, range, window, trend, on_missing } = condition;

  // Check if it's a derived metric (will be handled separately)
  if (derivedMetrics[field]) {
    // Mark as derived metric - will be computed in post-processing
    return {
      sql: null, // Will be handled by derived metrics resolver
      params: [],
      isDerived: true,
      field,
      operator,
      value,
      window,
      range,
      trend
    };
  }

  // Range condition
  if (range) {
    return compileRangeCondition(field, range, paramIndex);
  }

  // Trend condition
  if (trend) {
    return compileTrendCondition(field, trend, window, paramIndex);
  }

  // Window condition (time-windowed aggregation)
  if (window) {
    return compileWindowCondition(field, operator, value, window, paramIndex);
  }

  // Basic condition
  // Allow fields not in map (might be computed or in different table)
  const fieldRef = fieldMap[field] || `financials.${field}`;

  const operators = {
    '<': '<',
    '>': '>',
    '<=': '<=',
    '>=': '>=',
    '=': '=',
    '!=': '!='
  };

  if (!operators[operator]) {
    throw new Error(`Unsupported operator: ${operator}`);
  }

  // Handle null/missing data policy
  const nullCheck = on_missing === 'fail' 
    ? ` AND ${fieldRef} IS NOT NULL`
    : '';

  return {
    sql: `${fieldRef} ${operators[operator]} $${paramIndex}${nullCheck}`,
    params: [value],
    isDerived: false
  };
};

/**
 * Compiles a range condition: field BETWEEN min AND max
 */
function compileRangeCondition(field, range, paramIndex) {
  const { min, max, inclusive = true } = range;
  const fieldRef = fieldMap[field] || `financials.${field}`;
  
  if (min !== undefined && max !== undefined) {
    const op = inclusive ? 'BETWEEN' : '>';
    const op2 = inclusive ? 'AND' : '<';
    return {
      sql: `${fieldRef} ${op} $${paramIndex} ${op2} $${paramIndex + 1}`,
      params: [min, max],
      isDerived: false
    };
  } else if (min !== undefined) {
    const op = inclusive ? '>=' : '>';
    return {
      sql: `${fieldRef} ${op} $${paramIndex}`,
      params: [min],
      isDerived: false
    };
  } else if (max !== undefined) {
    const op = inclusive ? '<=' : '<';
    return {
      sql: `${fieldRef} ${op} $${paramIndex}`,
      params: [max],
      isDerived: false
    };
  }
  
  throw new Error('Range must define at least min or max');
}

/**
 * Compiles a trend condition: checks if values are increasing/decreasing over window
 */
function compileTrendCondition(field, trend, window, paramIndex) {
  const { type, length } = window;
  const fieldRef = fieldMap[field] || `financials.${field}`;
  const table = type === 'quarters' ? 'fundamentals_quarterly' : 'fundamentals_annual';
  const periodField = type === 'quarters' ? 'fiscal_period' : 'fiscal_year';
  
  // For trend, we need to check ordering of values
  // This is complex SQL - we'll use window functions
  const trendSQL = trend === 'increasing' 
    ? `(LAG(${fieldRef}) OVER (ORDER BY ${periodField}) < ${fieldRef})`
    : trend === 'decreasing'
    ? `(LAG(${fieldRef}) OVER (ORDER BY ${periodField}) > ${fieldRef})`
    : `(ABS(${fieldRef} - AVG(${fieldRef}) OVER (ORDER BY ${periodField} ROWS BETWEEN ${length - 1} PRECEDING AND CURRENT ROW)) < AVG(${fieldRef}) OVER (ORDER BY ${periodField} ROWS BETWEEN ${length - 1} PRECEDING AND CURRENT ROW) * 0.1)`;
  
  // Simplified: check last N periods
  return {
    sql: `EXISTS (
      SELECT 1 FROM ${table} f
      WHERE f.ticker = stocks.ticker
      AND f.${periodField} >= (
        SELECT MAX(${periodField}) - INTERVAL '${length} ${type === 'quarters' ? 'months' : 'years'}'
        FROM ${table}
        WHERE ticker = stocks.ticker
      )
      GROUP BY f.ticker
      HAVING COUNT(*) >= ${length}
      AND ${trendSQL}
    )`,
    params: [],
    isDerived: false,
    requiresSubquery: true
  };
}

/**
 * Compiles a window condition: aggregates values over time window
 */
function compileWindowCondition(field, operator, value, window, paramIndex) {
  const { type, length, aggregation = 'avg' } = window;
  const fieldRef = fieldMap[field] || `financials.${field}`;
  const table = type === 'quarters' ? 'fundamentals_quarterly' : 'fundamentals_annual';
  const periodField = type === 'quarters' ? 'fiscal_period' : 'fiscal_year';
  
  const aggFunc = {
    'avg': 'AVG',
    'sum': 'SUM',
    'latest': 'MAX', // Get latest period's value
    'cagr': 'CAGR' // Special handling needed
  }[aggregation] || 'AVG';
  
  if (aggregation === 'cagr') {
    // CAGR requires special calculation: ((end/start)^(1/years) - 1) * 100
    return {
      sql: `(
        SELECT POWER(
          MAX(${fieldRef})::NUMERIC / NULLIF(MIN(${fieldRef}), 0),
          1.0 / NULLIF(COUNT(DISTINCT ${periodField}) - 1, 0)
        ) - 1
        FROM ${table}
        WHERE ticker = stocks.ticker
        AND ${periodField} >= (
          SELECT ${type === 'quarters' 
            ? `MAX(${periodField}) - INTERVAL '${length * 3} months'`
            : `MAX(${periodField}) - ${length}`}
          FROM ${table}
          WHERE ticker = stocks.ticker
        )
        AND ${fieldRef} IS NOT NULL
        GROUP BY ticker
        HAVING COUNT(*) >= 2
      ) ${operator} $${paramIndex}`,
      params: [value],
      isDerived: false,
      requiresSubquery: true
    };
  }
  
  // Standard aggregation
  return {
    sql: `(
      SELECT ${aggFunc}(${fieldRef})
      FROM ${table}
      WHERE ticker = stocks.symbol
      AND ${periodField} >= (
        SELECT MAX(${periodField}) - INTERVAL '${length} ${type === 'quarters' ? 'months' : 'years'}'
        FROM ${table}
        WHERE ticker = stocks.ticker
      )
      AND ${fieldRef} IS NOT NULL
      GROUP BY ticker
      HAVING COUNT(*) >= ${length}
    ) ${operator} $${paramIndex}`,
    params: [value],
    isDerived: false,
    requiresSubquery: true
  };
}
