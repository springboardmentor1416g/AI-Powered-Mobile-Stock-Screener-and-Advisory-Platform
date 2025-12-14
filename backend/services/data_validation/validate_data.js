const fs = require('fs');
const path = require('path');

const missingValidator = require('./validators/missingDataValidator');
const schemaValidator = require('./validators/schemaValidator');

const LOG_DIR = path.join(__dirname, 'logs');
const REPORT_DIR = path.join(__dirname, 'reports');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

module.exports = function validateRow(row) {
  const issues = [
    ...missingValidator(row),
    ...schemaValidator(row)
  ];

  return issues;
};
