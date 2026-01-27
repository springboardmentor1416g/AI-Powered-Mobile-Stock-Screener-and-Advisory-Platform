/**
 * Initial Data Loader
 * Loads sample stock data from Twelve Data API
 */

require('dotenv').config();
const dataIngestion = require('../src/services/market_data/data_ingestion');
const logger = require('../src/config/logger');

// Sample tickers to load
const SAMPLE_TICKERS = [
  // US Tech Stocks
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'META',
  'NVDA',
  'TSLA',
  
  // Indian Stocks (NSE)
  'TCS.NSE',
  'INFY.NSE',
  'RELIANCE.NSE',
  'HDFCBANK.NSE',
  'ITC.NSE',
  'WIPRO.NSE',
  'TATAMOTORS.NSE',
  'BHARTIARTL.NSE',
];

async function loadInitialData() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   INITIAL DATA LOADING SCRIPT             ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log(`📊 Stocks to load: ${SAMPLE_TICKERS.length}`);
  console.log(`⚠️  Twelve Data Free Tier: 8 API calls/minute`);
  console.log(`⏱️  Estimated time: ~${Math.ceil(SAMPLE_TICKERS.length * 2 / 8)} minutes\n`);

  const results = {
    successful: [],
    failed: [],
  };

  for (let i = 0; i < SAMPLE_TICKERS.length; i++) {
    const ticker = SAMPLE_TICKERS[i];
    
    console.log(`\n[${i + 1}/${SAMPLE_TICKERS.length}] Processing ${ticker}...`);
    console.log('─'.repeat(50));

    try {
      // Load company profile
      console.log('  ➤ Loading company profile...');
      const profileResult = await dataIngestion.ingestCompanyProfile(ticker);
      
      if (profileResult.success) {
        console.log('  ✓ Profile loaded');
      } else {
        console.log(`  ✗ Profile failed: ${profileResult.error}`);
      }

      // Load price history (last 365 days)
      console.log('  ➤ Loading price history...');
      const priceResult = await dataIngestion.ingestPriceHistory(ticker, '1day', 365);
      
      if (priceResult.success) {
        console.log(`  ✓ Loaded ${priceResult.recordCount} price records`);
      } else {
        console.log(`  ✗ Price history failed: ${priceResult.error}`);
      }

      results.successful.push(ticker);

      // Rate limiting: Wait 8 seconds between stocks (Twelve Data free tier)
      if (i < SAMPLE_TICKERS.length - 1) {
        console.log('  ⏳ Waiting 8 seconds (API rate limit)...');
        await sleep(8000);
      }

    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
      results.failed.push({ ticker, error: error.message });
    }
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║           LOADING COMPLETE                ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`✓ Successful: ${results.successful.length}`);
  console.log(`✗ Failed: ${results.failed.length}\n`);

  if (results.failed.length > 0) {
    console.log('Failed tickers:');
    results.failed.forEach(f => {
      console.log(`  - ${f.ticker}: ${f.error}`);
    });
  }

  console.log('\n✅ Data loading complete!');
  console.log('You can now start the server: npm start\n');
  
  process.exit(0);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the loader
loadInitialData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
