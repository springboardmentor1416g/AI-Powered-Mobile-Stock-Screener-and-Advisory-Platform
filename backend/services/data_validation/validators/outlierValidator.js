module.exports = function outlierValidator(rows) {
  const issues = [];
  const revenues = rows.map(r => r.revenue).filter(Boolean);

  const mean = revenues.reduce((a,b)=>a+b,0) / revenues.length;
  const std = Math.sqrt(
    revenues.reduce((a,b)=>a + Math.pow(b-mean,2),0) / revenues.length
  );

  rows.forEach(r => {
    if (r.revenue > mean + 4 * std) {
      issues.push({
        severity: 'WARN',
        issue: 'Revenue outlier',
        period: r.fiscal_period
      });
    }
  });

  return issues;
};
