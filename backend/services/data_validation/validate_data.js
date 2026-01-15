const missingValidator = require('./validators/missingDataValidator');
const schemaValidator = require('./validators/schemaValidator');

const issues = [];

/**
 * Validate a single row and collect issues
 */
function validateRow(row) {
  const foundIssues = [
    ...missingValidator(row),
    ...schemaValidator(row)
  ];

  foundIssues.forEach(issue => {
    issues.push({
      ticker: row.ticker,
      issue_type: issue.issue,
      severity: issue.severity,
      affected_period: row.fiscal_period,
      suggested_action:
        issue.severity === 'HIGH' ? 'Skip record' : 'Manual review'
    });
  });

  return foundIssues;
}

/**
 * Return all collected issues
 */
function getIssues() {
  return issues;
}

module.exports = {
  validateRow,
  getIssues
};
