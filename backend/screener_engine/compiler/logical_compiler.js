const compileCondition = require('./condition_compiler');

function compileGroup(conditions, joiner = 'AND', startIndex = 1) {
  let sqlParts = [];
  let params = [];
  let derivedMetrics = [];
  let index = startIndex;

  for (const condition of conditions) {
    if (condition.and) {
      const nested = compileGroup(condition.and, 'AND', index);
      sqlParts.push(`(${nested.sql})`);
      params.push(...nested.params);
      if (nested.derivedMetrics) {
        derivedMetrics.push(...nested.derivedMetrics);
      }
      index += nested.params.length;
    } 
    else if (condition.or) {
      const nested = compileGroup(condition.or, 'OR', index);
      sqlParts.push(`(${nested.sql})`);
      params.push(...nested.params);
      if (nested.derivedMetrics) {
        derivedMetrics.push(...nested.derivedMetrics);
      }
      index += nested.params.length;
    }
    else if (condition.not) {
      const nested = compileGroup([condition.not], 'AND', index);
      sqlParts.push(`NOT (${nested.sql})`);
      params.push(...nested.params);
      if (nested.derivedMetrics) {
        derivedMetrics.push(...nested.derivedMetrics);
      }
      index += nested.params.length;
    }
    else {
      const compiled = compileCondition(condition, index);
      
      // Track derived metrics separately
      if (compiled.isDerived) {
        derivedMetrics.push({
          field: compiled.field,
          operator: compiled.operator,
          value: compiled.value,
          window: compiled.window,
          range: compiled.range,
          trend: compiled.trend
        });
        // For derived metrics, we'll filter in post-processing
        // Add a placeholder that will be true for now
        sqlParts.push('1=1'); // Placeholder - will be filtered in post-processing
      } else {
        sqlParts.push(compiled.sql);
        params.push(...compiled.params);
        index += compiled.params.length;
      }
    }
  }

  return {
    sql: sqlParts.join(` ${joiner} `),
    params,
    derivedMetrics: derivedMetrics.length > 0 ? derivedMetrics : undefined
  };
}

module.exports = compileGroup;
