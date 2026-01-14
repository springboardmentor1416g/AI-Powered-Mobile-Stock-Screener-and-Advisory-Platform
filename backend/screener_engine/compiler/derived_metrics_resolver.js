const derivedMetrics = require('../derived_metrics');
const { DerivedMetricError } = require('../derived_metrics/errors');

/**
 * Resolves derived metrics by computing them from base metrics
 * Returns filtered results based on derived metric conditions
 */
async function resolveDerivedMetrics(candidates, derivedMetricConditions, db) {
  if (!derivedMetricConditions || derivedMetricConditions.length === 0) {
    return candidates;
  }

  const results = [];
  
  for (const candidate of candidates) {
    let passes = true;
    
    for (const condition of derivedMetricConditions) {
      const { field, operator, value, window, range, trend } = condition;
      const metricDef = derivedMetrics[field];
      
      if (!metricDef) {
        throw new Error(`Unknown derived metric: ${field}`);
      }

      try {
        // Fetch required base metrics
        const baseData = await fetchBaseMetricsForDerived(
          candidate.ticker || candidate.symbol,
          metricDef.requires,
          window,
          db
        );

        // Compute derived metric
        const computedValue = metricDef.compute(baseData);

        // Apply filter condition
        if (!evaluateCondition(computedValue, operator, value, range)) {
          passes = false;
          break;
        }
      } catch (error) {
        if (error instanceof DerivedMetricError) {
          // Invalid metric computation - exclude this candidate
          passes = false;
          break;
        }
        throw error;
      }
    }

    if (passes) {
      results.push(candidate);
    }
  }

  return results;
}

/**
 * Fetches base metrics required for computing a derived metric
 */
async function fetchBaseMetricsForDerived(ticker, requiredFields, window, db) {
  const data = {};
  
  // Map field names to database columns
  const fieldToColumn = {
    'pe_ratio': 'pe_ratio',
    'eps_growth': 'eps', // Will compute growth from eps_history
    'debt': 'total_debt',
    'total_debt': 'total_debt',
    'free_cash_flow': 'free_cash_flow',
    'revenue': 'revenue',
    'eps': 'eps',
    'eps_history': 'eps',
    'revenue_history': 'revenue'
  };

  // Determine which table to query based on window
  // Default to quarterly if no window specified
  const table = window && window.type === 'years' 
    ? 'fundamentals_annual' 
    : 'fundamentals_quarterly';
  
  const periodField = window && window.type === 'years' 
    ? 'year' 
    : 'period_end';

  // Build query to fetch required fields
  const columns = requiredFields
    .map(field => {
      const col = fieldToColumn[field] || field;
      return col;
    })
    .filter((v, i, a) => a.indexOf(v) === i); // Unique

  if (columns.length === 0) {
    return data;
  }

  let query = `
    SELECT ${columns.join(', ')}, ${periodField}
    FROM ${table}
    WHERE ticker = $1
  `;

  const params = [ticker];

  // Add window constraint if specified
  if (window && window.length) {
    query += ` AND ${periodField} >= (
      SELECT MAX(${periodField}) - INTERVAL '${window.length} ${window.type === 'quarters' ? 'months' : 'years'}'
      FROM ${table}
      WHERE ticker = $1
    )`;
  }

  query += ` ORDER BY ${periodField} DESC LIMIT ${window && window.length ? window.length : 10}`;

  let result = await db.query(query, params);
  
  // Handle case where free_cash_flow is needed but not in fundamentals table
  if (requiredFields.includes('free_cash_flow')) {
    const hasFCF = result.rows.some(row => row.free_cash_flow !== null && row.free_cash_flow !== undefined);
    if (!hasFCF) {
      // Try cashflow_statements table
      const cashflowQuery = `
        SELECT free_cash_flow, ${periodField === 'year' ? 'EXTRACT(YEAR FROM period_end)::INTEGER as year' : 'period_end'}
        FROM cashflow_statements
        WHERE ticker = $1
        ORDER BY period_end DESC
        LIMIT ${window && window.length ? window.length : 10}
      `;
      const cashflowResult = await db.query(cashflowQuery, [ticker]);
      if (cashflowResult.rows.length > 0) {
        // Merge cashflow data with existing rows or create new ones
        for (const cfRow of cashflowResult.rows) {
          const matchingRow = result.rows.find(r => {
            if (periodField === 'year') {
              return r.year === cfRow.year;
            }
            return r.period_end && cfRow.period_end && 
                   r.period_end.getTime() === cfRow.period_end.getTime();
          });
          if (matchingRow) {
            matchingRow.free_cash_flow = cfRow.free_cash_flow;
          } else {
            result.rows.push({ 
              free_cash_flow: cfRow.free_cash_flow, 
              [periodField]: cfRow[periodField] 
            });
          }
        }
      }
    }
  }
  
  if (result.rows.length === 0) {
    throw new DerivedMetricError('NO_DATA', 'No data available for derived metric computation');
  }

  // Transform results into format expected by derived metric functions
  for (const field of requiredFields) {
    if (field.includes('_history') || field.includes('_series')) {
      // Time series field
      const baseField = field.replace('_history', '').replace('_series', '');
      const col = fieldToColumn[baseField] || baseField;
      data[field] = result.rows.map(row => parseFloat(row[col]) || 0);
    } else {
      // Single value field - use latest
      const col = fieldToColumn[field] || field;
      data[field] = parseFloat(result.rows[0][col]) || 0;
    }
  }

  // Compute growth rates if needed
  if (requiredFields.includes('eps_growth') && data.eps_history && data.eps_history.length >= 2) {
    const latest = data.eps_history[0];
    const previous = data.eps_history[1];
    if (previous > 0) {
      data.eps_growth = ((latest - previous) / previous) * 100;
    } else {
      data.eps_growth = 0;
    }
  }

  return data;
}

/**
 * Evaluates a condition against a computed value
 */
function evaluateCondition(computedValue, operator, value, range) {
  if (range) {
    const { min, max, inclusive = true } = range;
    if (min !== undefined && max !== undefined) {
      return inclusive 
        ? computedValue >= min && computedValue <= max
        : computedValue > min && computedValue < max;
    } else if (min !== undefined) {
      return inclusive ? computedValue >= min : computedValue > min;
    } else if (max !== undefined) {
      return inclusive ? computedValue <= max : computedValue < max;
    }
  }

  // Standard operator evaluation
  switch (operator) {
    case '<': return computedValue < value;
    case '>': return computedValue > value;
    case '<=': return computedValue <= value;
    case '>=': return computedValue >= value;
    case '=': return computedValue === value;
    case '!=': return computedValue !== value;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

module.exports = {
  resolveDerivedMetrics,
  fetchBaseMetricsForDerived
};
