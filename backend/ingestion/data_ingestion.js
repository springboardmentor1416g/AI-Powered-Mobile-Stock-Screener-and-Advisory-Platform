require('dotenv').config();

const fs = require('fs');
const path = require('path');   // ✅ MUST come before usage
const { Pool } = require('pg');

// 🔍 DIAGNOSTIC IMPORT (absolute path)
const servicePath = path.resolve(__dirname, '../services/market_data_service.js');
console.log('SERVICE FILE PATH:', servicePath);

const marketService = require(servicePath);
console.log('DEBUG market_data_service exports:', marketService);

const {
  fetchDailyOHLCV,
  fetchCompanyOverview
} = marketService;


// ------------------ CONFIG ------------------
const TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  'NVDA', 'TSLA', 'INTC', 'AMD', 'NFLX'
];

const RAW_BASE_DIR = path.join(__dirname, '../../storage/raw');
const LOG_DIR = path.join(__dirname, '../../logs');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: DATABASE_URL });

// ------------------ HELPERS ------------------
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function log(message) {
  ensureDir(LOG_DIR);
  const logFile = path.join(
    LOG_DIR,
    `ingestion_${new Date().toISOString().slice(0, 10)}.log`
  );
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  console.log(message);
}

// ------------------ DB INSERTS ------------------
async function upsertCompany(metadata) {
  if (!metadata || !metadata.Symbol) return;

  const query = `
    INSERT INTO companies (ticker, name, sector, industry, exchange, market_cap)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (ticker) DO UPDATE SET
      name = EXCLUDED.name,
      sector = EXCLUDED.sector,
      industry = EXCLUDED.industry,
      market_cap = EXCLUDED.market_cap;
  `;

  const values = [
    metadata.Symbol,
    metadata.Name || null,
    metadata.Sector || null,
    metadata.Industry || null,
    metadata.Exchange || 'NASDAQ',
    metadata.MarketCapitalization
      ? parseInt(metadata.MarketCapitalization, 10)
      : null
  ];

  await pool.query(query, values);
}

async function insertPriceHistory(ticker, timeSeries) {
  const insertQuery = `
    INSERT INTO price_history (time, ticker, open, high, low, close, volume)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (time, ticker) DO NOTHING;
  `;

  for (const [date, values] of Object.entries(timeSeries)) {
    const row = [
      new Date(date),
      ticker,
      parseFloat(values['1. open']),
      parseFloat(values['2. high']),
      parseFloat(values['3. low']),
      parseFloat(values['4. close']),
      Number.isFinite(parseInt(values['6. volume'], 10))
      ? parseInt(values['6. volume'], 10)
        : null
    ];

    await pool.query(insertQuery, row);
  }
}

// ------------------ MAIN PIPELINE ------------------
async function runIngestion() {
  const today = new Date().toISOString().slice(0, 10);
  const rawDir = path.join(RAW_BASE_DIR, today);
  ensureDir(rawDir);

  log('Starting market data ingestion');

  for (const ticker of TICKERS) {
    try {
      log(`Fetching metadata for ${ticker}`);
      const metadata = await fetchCompanyOverview(ticker);
      await upsertCompany(metadata);

      log(`Fetching OHLCV data for ${ticker}`);
      const ohlcvData = await fetchDailyOHLCV(ticker);

      // Save raw JSON
      const rawFile = path.join(rawDir, `${ticker}.json`);
      fs.writeFileSync(rawFile, JSON.stringify(ohlcvData, null, 2));

      if (ohlcvData['Note']) {
        throw new Error(`Alpha Vantage rate limit hit for ${ticker}`);
      }

      if (ohlcvData['Error Message']) {
        throw new Error(`Alpha Vantage error for ${ticker}`);
      }

      const timeSeries = ohlcvData['Time Series (Daily)'];
      if (!timeSeries || Object.keys(timeSeries).length === 0) {
        throw new Error(`No time series found for ${ticker}`);
      }

      await insertPriceHistory(ticker, timeSeries);

      log(`Successfully ingested ${ticker}`);
    } catch (err) {
      log(`ERROR ingesting ${ticker}: ${err.message}`);
    }
  }

  log('Market data ingestion completed');
  await pool.end();
}

// Execute
runIngestion().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});