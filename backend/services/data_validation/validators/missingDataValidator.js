const { REQUIRED_METRICS } = require('../rules/thresholds');

module.exports = function missingDataValidator(row) {
  const issues = [];

  REQUIRED_METRICS.forEach(metric => {
    if (row[metric] == null) {
      issues.push({
        severity: 'HIGH',
        issue: `Missing ${metric}`
      });
    }
  });

  return issues;
};
