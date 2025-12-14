require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parseSimFinCSV } = require('../services/fundamentals_data_service');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1
});

const BASE_PATH = path.join(__dirname, '../../data/raw/fundamentals');
const PROCESSED_DIR = path.join(__dirname, '../../data/processed/fundamentals');

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

  await parseSimFinCSV(
    path.join(BASE_PATH, 'simfin_income_quarterly.csv'),
    'quarterly',
    async (batch) => {
      batch.forEach(row => appendToProcessedCSV(row, 'quarterly'));
      await insertBatch(batch, 'fundamentals_quarterly');
    }
  );

  await parseSimFinCSV(
    path.join(BASE_PATH, 'simfin_income_annual.csv'),
    'annual',
    async (batch) => {
      batch.forEach(row => appendToProcessedCSV(row, 'annual'));
      await insertBatch(batch, 'fundamentals_annual');
    }
  );

  await pool.end();
  console.log('Fundamentals ingestion completed successfully');
}

run().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
