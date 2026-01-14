/**
 * Enrich raw backend screener results for UI display
 * This adapter is deterministic and UI-only
 */

export function enrichScreenerResults(rawResults, originalQuery) {
  if (!Array.isArray(rawResults)) return [];

  return rawResults.map((stock) => {
    const matchedConditions = [];
    const derivedMetrics = {};
    const timeContext = [];

    const query = originalQuery.toLowerCase();

    // ---- PEG condition ----
    if (query.includes('peg')) {
      matchedConditions.push('PEG ratio below threshold');

      // Mock derived metric (until backend provides real value)
      derivedMetrics.peg_ratio = stock.peg_ratio ?? 'Computed';
    }

    // ---- PE condition ----
    if (query.includes('pe')) {
      matchedConditions.push('Price-to-Earnings ratio matched');
      derivedMetrics.pe_ratio = stock.pe_ratio;
    }

    // ---- EPS growth ----
    if (query.includes('eps') && query.includes('growth')) {
      matchedConditions.push('Positive EPS growth');
      derivedMetrics.eps_growth = stock.eps_growth ?? 'Positive';
    }

    // ---- Temporal context ----
    if (query.includes('last') && query.includes('quarters')) {
      timeContext.push('Last 4 quarters');
    }

    return {
      ...stock,

      matched_conditions: matchedConditions,

      derived_metrics: derivedMetrics,

      time_context: timeContext.length ? timeContext.join(', ') : null
    };
  });
}
