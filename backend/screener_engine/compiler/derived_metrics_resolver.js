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
          window || condition.window, // Use condition's window if metricDef doesn't specify
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
    'eps_series': 'eps', // Alias for eps_history
    'revenue_history': 'revenue',
    'revenue_series': 'revenue' // Alias for revenue_history
  };

  // Determine which table to query based on window
  // Default to quarterly if no window specified
  const table = window && window.type === 'years' 
    ? 'fundamentals_annual' 
    : 'fundamentals_quarterly';
  
  const periodField = window && window.type === 'years' 
    ? 'fiscal_year' 
    : 'fiscal_period';

  // Build query to fetch required fields
  // Separate fields that exist in fundamentals vs metrics_normalized
  const fundamentalsColumns = [];
  const metricsColumns = [];
  
  for (const field of requiredFields) {
    const col = fieldToColumn[field] || field;
    // pe_ratio is in metrics_normalized, not fundamentals
    if (field === 'pe_ratio') {
      metricsColumns.push(col);
    } else {
      fundamentalsColumns.push(col);
    }
  }

  // Build query - may need to join with metrics_normalized
  let query = '';
  let hasFundamentals = fundamentalsColumns.length > 0;
  let hasMetrics = metricsColumns.length > 0;
  
  if (hasFundamentals && hasMetrics) {
    // Join both tables
    query = `
      SELECT ${fundamentalsColumns.join(', ')}, ${metricsColumns.join(', ')}, f.${periodField}
      FROM ${table} f
      LEFT JOIN metrics_normalized m ON f.ticker = m.ticker 
        AND m.period::DATE = f.${periodField}::DATE
      WHERE f.ticker = $1
    `;
  } else if (hasFundamentals) {
    // Only fundamentals
    query = `
      SELECT ${fundamentalsColumns.join(', ')}, ${periodField}
      FROM ${table}
      WHERE ticker = $1
    `;
  } else if (hasMetrics) {
    // Only metrics_normalized
    query = `
      SELECT ${metricsColumns.join(', ')}, period as ${periodField}
      FROM metrics_normalized
      WHERE ticker = $1
    `;
  } else {
    return data;
  }

  const params = [ticker];

  // Add window constraint if specified
  if (window && window.length) {
    const tableAlias = hasFundamentals && hasMetrics ? 'f' : '';
    const periodRef = tableAlias ? `${tableAlias}.${periodField}` : periodField;
    
    if (window.type === 'quarters') {
      // For quarters, subtract months
      query += ` AND ${periodRef} >= (
        SELECT MAX(${periodField}) - INTERVAL '${window.length * 3} months'
        FROM ${table}
        WHERE ticker = $1
      )`;
    } else {
      // For years, subtract years (fiscal_year is INTEGER)
      query += ` AND ${periodRef} >= (
        SELECT MAX(${periodField}) - ${window.length}
        FROM ${table}
        WHERE ticker = $1
      )`;
    }
  }

  const periodRef = (hasFundamentals && hasMetrics ? 'f.' : '') + periodField;
  query += ` ORDER BY ${periodRef} DESC LIMIT ${window && window.length ? window.length : 10}`;

  let result = await db.query(query, params);
  
  // Handle case where free_cash_flow is needed but not in fundamentals table
  if (requiredFields.includes('free_cash_flow')) {
    const hasFCF = result.rows.some(row => row.free_cash_flow !== null && row.free_cash_flow !== undefined);
    if (!hasFCF) {
      // Try cashflow_statements table
      const cashflowQuery = `
        SELECT free_cash_flow, ${periodField === 'fiscal_year' ? 'EXTRACT(YEAR FROM period_end)::INTEGER as fiscal_year' : 'period_end as fiscal_period'}
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
            if (periodField === 'fiscal_year') {
              return r.fiscal_year === cfRow.fiscal_year;
            }
            return r.fiscal_period && cfRow.fiscal_period && 
                   r.fiscal_period.getTime() === cfRow.fiscal_period.getTime();
          });
          if (matchingRow) {
            matchingRow.free_cash_flow = cfRow.free_cash_flow;
          } else {
            result.rows.push({ 
              free_cash_flow: cfRow.free_cash_flow, 
              [periodField]: cfRow[periodField === 'fiscal_year' ? 'fiscal_year' : 'fiscal_period'] 
            });
          }
        }
      }
    }
  }
  
  if (result.rows.length === 0) {
    // Return empty data object - let the metric computation handle the error
    return {};
  }

  // Transform results into format expected by derived metric functions
  for (const field of requiredFields) {
    if (field.includes('_history') || field.includes('_series')) {
      // Time series field
      const baseField = field.replace('_history', '').replace('_series', '');
      const col = fieldToColumn[baseField] || baseField;
      // Handle pe_ratio from metrics_normalized (may be null)
      const seriesData = result.rows.map(row => {
        if (baseField === 'pe_ratio') {
          return parseFloat(row['pe_ratio']) || null;
        }
        return parseFloat(row[col]) || 0;
      });
      data[field] = seriesData;
      // Create aliases for compatibility (eps_history <-> eps_series)
      if (field === 'eps_history') {
        data['eps_series'] = seriesData;
      } else if (field === 'eps_series') {
        data['eps_history'] = seriesData;
      }
      if (field === 'revenue_history') {
        data['revenue_series'] = seriesData;
      } else if (field === 'revenue_series') {
        data['revenue_history'] = seriesData;
      }
    } else {
      // Single value field - use latest
      const col = fieldToColumn[field] || field;
      // Handle pe_ratio from metrics_normalized (may be null)
      if (field === 'pe_ratio') {
        data[field] = parseFloat(result.rows[0]?.['pe_ratio']) || null;
      } else {
        data[field] = parseFloat(result.rows[0]?.[col]) || 0;
      }
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
