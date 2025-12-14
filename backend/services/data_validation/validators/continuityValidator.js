module.exports = function continuityValidator(rowsByTicker) {
  const issues = [];

  rowsByTicker.forEach(rows => {
    const sorted = rows.sort((a, b) =>
      new Date(a.report_date) - new Date(b.report_date)
    );

    for (let i = 1; i < sorted.length; i++) {
      const diffMonths =
        (new Date(sorted[i].report_date) -
         new Date(sorted[i - 1].report_date)) / (1000 * 60 * 60 * 24 * 30);

      if (diffMonths > 4) {
        issues.push({
          severity: 'HIGH',
          issue: 'Missing quarter',
          period: sorted[i].fiscal_period
        });
      }
    }
  });

  return issues;
};
