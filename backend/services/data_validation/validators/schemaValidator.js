module.exports = function schemaValidator(row) {
  const issues = [];

  if (isNaN(Number(row.fiscal_year))) {
    issues.push({ severity: 'HIGH', issue: 'Invalid fiscal_year' });
  }

  if (row.currency && !['USD', 'INR'].includes(row.currency)) {
    issues.push({ severity: 'MEDIUM', issue: 'Unsupported currency' });
  }

  if (isNaN(Date.parse(row.report_date))) {
    issues.push({ severity: 'HIGH', issue: 'Invalid report_date' });
  }

  return issues;
};
