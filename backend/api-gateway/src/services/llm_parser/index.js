async function translateNLToDSL(query) {
  const q = query.toLowerCase();
  const conditions = [];

  // PE Ratio patterns
  if (q.includes('pe') || q.includes('p/e')) {
    if (q.includes('< 15') || q.includes('below 15') || q.includes('less than 15')) {
      conditions.push({ field: 'pe_ratio', operator: '<', value: 15 });
    } else if (q.includes('< 20') || q.includes('below 20')) {
      conditions.push({ field: 'pe_ratio', operator: '<', value: 20 });
    } else if (q.includes('< 5') || q.includes('below 5')) {
      conditions.push({ field: 'pe_ratio', operator: '<', value: 5 });
    } else if (q.includes('< 30') || q.includes('below 30')) {
      conditions.push({ field: 'pe_ratio', operator: '<', value: 30 });
    } else if (q.includes('> 15') || q.includes('above 15') || q.includes('greater than 15')) {
      conditions.push({ field: 'pe_ratio', operator: '>', value: 15 });
    } else if (q.includes('> 20')) {
      conditions.push({ field: 'pe_ratio', operator: '>', value: 20 });
    }
  }

  // ROE patterns
  if (q.includes('roe')) {
    if (q.includes('> 15') || q.includes('above 15') || q.includes('greater than 15')) {
      conditions.push({ field: 'roe', operator: '>', value: 0.15 });
    } else if (q.includes('> 20') || q.includes('above 20')) {
      conditions.push({ field: 'roe', operator: '>', value: 0.20 });
    } else if (q.includes('> 0.15') || q.includes('> 0.2')) {
      const value = q.includes('0.2') ? 0.2 : 0.15;
      conditions.push({ field: 'roe', operator: '>', value });
    }
  }

  // Revenue growth patterns
  if (q.includes('revenue growth') || q.includes('revenue')) {
    if (q.includes('positive') || q.includes('> 0') || q.includes('growth')) {
      conditions.push({ field: 'revenue_growth_yoy', operator: '>', value: 0 });
    }
  }

  // Earnings patterns
  if (q.includes('earnings')) {
    if (q.includes('positive') || q.includes('growth')) {
      conditions.push({ field: 'earnings_growth_yoy', operator: '>', value: 0 });
    }
  }

  // Debt patterns
  if (q.includes('debt') || q.includes('leverage')) {
    if (q.includes('low') || q.includes('< 0.5')) {
      conditions.push({ field: 'debt_to_fcf', operator: '<', value: 0.5 });
    } else if (q.includes('< 1')) {
      conditions.push({ field: 'debt_to_fcf', operator: '<', value: 1 });
    }
  }

  // Sector patterns
  if (q.includes('tech') || q.includes('technology')) {
    conditions.push({ field: 'sector', operator: '=', value: 'Technology' });
  } else if (q.includes('finance') || q.includes('financial')) {
    conditions.push({ field: 'sector', operator: '=', value: 'Financial' });
  } else if (q.includes('healthcare') || q.includes('health')) {
    conditions.push({ field: 'sector', operator: '=', value: 'Healthcare' });
  }

  // If no conditions matched, use default
  if (conditions.length === 0) {
    conditions.push({ field: 'pe_ratio', operator: '<', value: 20 });
  }

  return { conditions };
}

module.exports = { translateNLToDSL };