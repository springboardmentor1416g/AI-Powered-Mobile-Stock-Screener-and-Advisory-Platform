/**
 * analyst_buyback_earnings_ingestion.js
 * 
 * Main ingestion pipeline for M6:
 * - Analyst price targets (Yahoo Finance)
 * - Earnings estimates and calendar (Yahoo Finance)
 * - Buyback announcements (CSV/JSON files)
 * 
 * Usage:
 *   node analyst_buyback_earnings_ingestion.js [--analysts|--earnings|--buybacks|--all]
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const analystService = require('../services/analyst_data_service');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: DATABASE_URL });

// Get tickers to process (from company master table or hardcoded)
const DEFAULT_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  'NVDA', 'TSLA', 'INTC', 'AMD', 'NFLX',
  'JPM', 'BAC', 'GS', 'WFC', 'C',
  'JNJ', 'UNH', 'LLY', 'MRK', 'AbbV'
];

const LOG_DIR = path.join(__dirname, '../../logs');
const BUYBACK_DATA_DIR = path.join(__dirname, '../../data/buyback_announcements');

const COMMAND = process.argv[2] || '--all';

// ============================================================================
// LOGGING
// ============================================================================

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function log(message, level = 'INFO') {
  ensureDir(LOG_DIR);
  const timestamp = new Date().toISOString();
  const logFile = path.join(
    LOG_DIR,
    `ingestion_analyst_${new Date().toISOString().slice(0, 10)}.log`
  );
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  fs.appendFileSync(logFile, logMessage + '\n');
  console.log(logMessage);
}

// ============================================================================
// ANALYST PRICE TARGETS & ESTIMATES
// ============================================================================

async function ingestAnalystPriceTargets(tickers) {
  log(`Starting analyst price targets ingestion for ${tickers.length} tickers...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const ticker of tickers) {
    try {
      log(`Fetching analyst price targets for ${ticker}`);
      const targets = await analystService.fetchAnalystPriceTargets(ticker);
      
      if (targets) {
        await analystService.upsertAnalystPriceTarget(targets);
        log(`Successfully ingested analyst targets for ${ticker}`, 'SUCCESS');
        successCount++;
      } else {
        log(`No analyst data found for ${ticker}`, 'WARN');
      }
    } catch (error) {
      log(`Error ingesting analyst targets for ${ticker}: ${error.message}`, 'ERROR');
      errorCount++;
    }

    // Rate limiting - Yahoo Finance is fairly lenient but let's be respectful
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await analystService.logIngestionMetadata(
    'analyst_price_targets',
    'Yahoo Finance',
    errorCount === 0,
    successCount,
    errorCount > 0 ? `${errorCount} tickers failed` : null
  );

  log(`Analyst price targets ingestion completed: ${successCount} succeeded, ${errorCount} failed`);
  return { successCount, errorCount };
}

// ============================================================================
// EARNINGS CALENDAR
// ============================================================================

async function ingestEarningsCalendar(tickers) {
  log(`Starting earnings calendar ingestion for ${tickers.length} tickers...`);
  
  let successCount = 0;
  let errorCount = 0;
  let eventCount = 0;

  for (const ticker of tickers) {
    try {
      log(`Fetching earnings calendar for ${ticker}`);
      const events = await analystService.fetchEarningsCalendar(ticker);
      
      if (events && events.length > 0) {
        for (const event of events) {
          await analystService.upsertEarningsEvent(event);
          eventCount++;
        }
        log(`Successfully ingested ${events.length} earnings events for ${ticker}`, 'SUCCESS');
        successCount++;
      } else {
        log(`No earnings calendar data found for ${ticker}`, 'WARN');
      }
    } catch (error) {
      log(`Error ingesting earnings calendar for ${ticker}: ${error.message}`, 'ERROR');
      errorCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await analystService.logIngestionMetadata(
    'earnings_calendar',
    'Yahoo Finance',
    errorCount === 0,
    eventCount,
    errorCount > 0 ? `${errorCount} tickers failed` : null
  );

  log(`Earnings calendar ingestion completed: ${successCount} succeeded, ${errorCount} failed, ${eventCount} events ingested`);
  return { successCount, errorCount, eventCount };
}

// ============================================================================
// EARNINGS ESTIMATES (Polygon.io optional)
// ============================================================================

async function ingestEarningsEstimates(tickers) {
  if (!process.env.POLYGON_API_KEY) {
    log('POLYGON_API_KEY not set, skipping earnings estimates ingestion', 'WARN');
    return { successCount: 0, errorCount: 0, skipped: true };
  }

  log(`Starting earnings estimates ingestion for ${tickers.length} tickers...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const ticker of tickers) {
    try {
      log(`Fetching earnings estimates for ${ticker}`);
      const estimates = await analystService.fetchEarningsEstimates(ticker);
      
      if (estimates) {
        await analystService.upsertEarningsEstimate(estimates);
        log(`Successfully ingested earnings estimates for ${ticker}`, 'SUCCESS');
        successCount++;
      }
    } catch (error) {
      log(`Error ingesting earnings estimates for ${ticker}: ${error.message}`, 'ERROR');
      errorCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  await analystService.logIngestionMetadata(
    'earnings_estimates',
    'Polygon.io',
    errorCount === 0,
    successCount,
    errorCount > 0 ? `${errorCount} tickers failed` : null
  );

  log(`Earnings estimates ingestion completed: ${successCount} succeeded, ${errorCount} failed`);
  return { successCount, errorCount };
}

// ============================================================================
// BUYBACK ANNOUNCEMENTS FROM CSV/JSON
// ============================================================================

async function ingestBuybackAnnouncements() {
  log('Starting buyback announcements ingestion...');
  
  ensureDir(BUYBACK_DATA_DIR);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  // Find all CSV/JSON files in buyback data directory
  const files = fs.readdirSync(BUYBACK_DATA_DIR)
    .filter(f => f.endsWith('.csv') || f.endsWith('.json'));

  if (files.length === 0) {
    log('No buyback data files found in ' + BUYBACK_DATA_DIR, 'WARN');
    await analystService.logIngestionMetadata(
      'buyback_announcements',
      'CSV/JSON',
      false,
      0,
      'No data files found'
    );
    return { successCount: 0, errorCount: 0, skippedCount: 0 };
  }

  for (const file of files) {
    try {
      const filePath = path.join(BUYBACK_DATA_DIR, file);
      log(`Processing buyback file: ${file}`);

      let records = [];
      if (file.endsWith('.json')) {
        const content = fs.readFileSync(filePath, 'utf8');
        records = JSON.parse(content);
      } else if (file.endsWith('.csv')) {
        const content = fs.readFileSync(filePath, 'utf8');
        records = parseCSV(content);
      }

      if (!Array.isArray(records)) {
        records = [records];
      }

      for (const record of records) {
        const validation = analystService.validateBuybackRecord(record);
        
        if (!validation.valid) {
          log(`Skipping invalid buyback record in ${file}: ${validation.errors.join('; ')}`, 'WARN');
          skippedCount++;
          continue;
        }

        const normalized = analystService.normalizeBuybackRecord(record);
        await analystService.upsertBuybackAnnouncement(normalized);
        successCount++;
      }

      log(`Successfully processed buyback file ${file}: ${successCount} records ingested`);
    } catch (error) {
      log(`Error processing buyback file ${file}: ${error.message}`, 'ERROR');
      errorCount++;
    }
  }

  await analystService.logIngestionMetadata(
    'buyback_announcements',
    'CSV/JSON',
    errorCount === 0,
    successCount,
    errorCount > 0 ? `${errorCount} files failed, ${skippedCount} records skipped` : null
  );

  log(`Buyback announcements ingestion completed: ${successCount} ingested, ${errorCount} errors, ${skippedCount} skipped`);
  return { successCount, errorCount, skippedCount };
}

// ============================================================================
// CSV PARSER (simple)
// ============================================================================

function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const record = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx];
    });
    records.push(record);
  }

  return records;
}

// ============================================================================
// MAIN ORCHESTRATION
// ============================================================================

async function main() {
  const startTime = new Date();
  log('='.repeat(80));
  log('Starting M6 Analyst, Buyback & Earnings Ingestion Pipeline');
  log(`Command: ${COMMAND}`);
  log('='.repeat(80));

  // Fetch tickers from database if available
  let tickers = DEFAULT_TICKERS;
  try {
    const result = await pool.query('SELECT DISTINCT ticker FROM companies ORDER BY ticker');
    if (result.rows.length > 0) {
      tickers = result.rows.map(r => r.ticker);
      log(`Loaded ${tickers.length} tickers from database`);
    }
  } catch (error) {
    log(`Could not load tickers from database, using defaults: ${error.message}`, 'WARN');
  }

  const results = {
    analyst_targets: null,
    earnings_calendar: null,
    earnings_estimates: null,
    buyback_announcements: null
  };

  try {
    // Execute requested ingestions
    if (COMMAND === '--all' || COMMAND === '--analysts') {
      results.analyst_targets = await ingestAnalystPriceTargets(tickers);
    }

    if (COMMAND === '--all' || COMMAND === '--earnings') {
      results.earnings_calendar = await ingestEarningsCalendar(tickers);
    }

    if (COMMAND === '--all' || COMMAND === '--estimates') {
      results.earnings_estimates = await ingestEarningsEstimates(tickers);
    }

    if (COMMAND === '--all' || COMMAND === '--buybacks') {
      results.buyback_announcements = await ingestBuybackAnnouncements();
    }

  } catch (error) {
    log(`FATAL ERROR: ${error.message}`, 'FATAL');
    process.exit(1);
  } finally {
    await pool.end();
  }

  // Summary
  const endTime = new Date();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log('='.repeat(80));
  log('INGESTION SUMMARY');
  log('='.repeat(80));
  Object.entries(results).forEach(([key, value]) => {
    if (value) {
      log(`${key}: ${JSON.stringify(value)}`);
    }
  });
  log(`Total duration: ${duration}s`);
  log('='.repeat(80));

  process.exit(0);
}

// Execute
if (require.main === module) {
  main().catch(error => {
    console.error('FATAL:', error);
    process.exit(1);
  });
}

module.exports = {
  ingestAnalystPriceTargets,
  ingestEarningsCalendar,
  ingestEarningsEstimates,
  ingestBuybackAnnouncements
};
