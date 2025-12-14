require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parseSimFinCSV } = require('../services/fundamentals_data_service');
const { validateRow, getIssues } =
  require('../services/data_validation/validate_data');

const {
  writeCSVReport,
  writeMarkdownReport
} = require('../services/data_validation/report_writer');


// ---------------- DB POOL ----------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1
});

// ---------------- PATHS ----------------
const BASE_PATH = path.join(__dirname, '../../data/raw/fundamentals');
const PROCESSED_DIR = path.join(__dirname, '../../data/processed/fundamentals');
const VALIDATION_LOG_DIR = path.join(
  __dirname,
  '../services/data_validation/logs'
);

// ---------------- VALIDATION LOGGING ----------------
if (!fs.existsSync(VALIDATION_LOG_DIR)) {
  fs.mkdirSync(VALIDATION_LOG_DIR, { recursive: true });
}

const validationLogFile = path.join(
  VALIDATION_LOG_DIR,
  `validation_${new Date().toISOString().slice(0, 10)}.log`
);

function logValidation(message, level = 'INFO') {
  const line = `[${level}] ${message}\n`;
  fs.appendFileSync(validationLogFile, line);
}

// ---------------- CSV WRITER ----------------
function appendToProcessedCSV(row, type) {
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  const filePath = path.join(
    PROCESSED_DIR,
    type === 'quarterly'
      ? 'fundamentals_quarterly.csv'
      : 'fundamentals_annual.csv'
  );

  const header =
    'ticker,fiscal_year,fiscal_period,report_date,revenue,gross_profit,operating_income,pretax_income,net_income,net_income_common,currency\n';

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, header);
  }

  const line = [
    row.ticker,
    row.fiscal_year,
    row.fiscal_period,
    row.report_date,
    row.revenue,
    row.gross_profit,
    row.operating_income,
    row.pretax_income,
    row.net_income,
    row.net_income_common,
    row.currency
  ]
    .map(v => (v === null || v === undefined ? '' : v))
    .join(',');

  fs.appendFileSync(filePath, line + '\n');
}

// ---------------- DB INSERT ----------------
async function insertBatch(rows, table) {
  if (!rows.length) return;

  const values = [];
  const placeholders = rows.map((r, i) => {
    const b = i * 11;
    values.push(
      r.ticker,
      r.fiscal_year,
      r.fiscal_period,
      r.report_date,
      r.revenue,
      r.gross_profit,
      r.operating_income,
      r.pretax_income,
      r.net_income,
      r.net_income_common,
      r.currency
    );
    return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},
             $${b + 5},$${b + 6},$${b + 7},$${b + 8},
             $${b + 9},$${b + 10},$${b + 11})`;
  });

  const query = `
    INSERT INTO ${table}
    (ticker, fiscal_year, fiscal_period, report_date,
     revenue, gross_profit, operating_income, pretax_income,
     net_income, net_income_common, currency)
    VALUES ${placeholders.join(',')}
    ON CONFLICT DO NOTHING
  `;

  await pool.query(query, values);
}

// ---------------- MAIN RUN ----------------
async function run() {
  console.log('Starting fundamentals ingestion (SimFin)');
  logValidation('Fundamentals validation + ingestion started', 'INFO');

  // -------- QUARTERLY --------
  await parseSimFinCSV(
    path.join(BASE_PATH, 'simfin_income_quarterly.csv'),
    'quarterly',
    async (batch) => {
      const validRows = [];

      batch.forEach(row => {
        const issues = validateRow(row);

        if (issues.length > 0) {
          issues.forEach(issue => {
            logValidation(
              `${row.ticker} - ${issue.issue} (${issue.severity}) [${row.fiscal_period}]`,
              issue.severity === 'HIGH' ? 'ERROR' : 'WARN'
            );
          });
        }

        // Block HIGH severity rows
        if (issues.some(i => i.severity === 'HIGH')) return;

        appendToProcessedCSV(row, 'quarterly');
        validRows.push(row);
      });

      await insertBatch(validRows, 'fundamentals_quarterly');
    }
  );

  // -------- ANNUAL --------
  await parseSimFinCSV(
    path.join(BASE_PATH, 'simfin_income_annual.csv'),
    'annual',
    async (batch) => {
      const validRows = [];

      batch.forEach(row => {
        const issues = validateRow(row);

        if (issues.length > 0) {
          issues.forEach(issue => {
            logValidation(
              `${row.ticker} - ${issue.issue} (${issue.severity}) [${row.fiscal_period}]`,
              issue.severity === 'HIGH' ? 'ERROR' : 'WARN'
            );
          });
        }

        if (issues.some(i => i.severity === 'HIGH')) return;

        appendToProcessedCSV(row, 'annual');
        validRows.push(row);
      });

      await insertBatch(validRows, 'fundamentals_annual');
    }
  );
    const {
    writeCSVReport,
    writeMarkdownReport
    } = require('../services/data_validation/report_writer');

    const { getIssues } = require('../services/data_validation/validate_data');

    const timestamp = new Date().toISOString().slice(0, 10);
    const issues = getIssues();

    writeCSVReport(issues, timestamp);
    writeMarkdownReport(issues, timestamp);

  await pool.end();
writeReports();
console.log('Fundamentals ingestion completed successfully');

  logValidation('Fundamentals validation + ingestion completed successfully', 'INFO');
  console.log('Fundamentals ingestion completed successfully');
}

run().catch(err => {
  console.error('FATAL:', err);
  logValidation(`FATAL ERROR: ${err.message}`, 'ERROR');


    const timestamp = new Date().toISOString().slice(0, 10);



  process.exit(1);
});
