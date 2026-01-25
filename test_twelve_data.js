require('dotenv').config();
const twelveDataService = require('./src/services/market_data/twelve_data_service');

async function test() {
  console.log('Testing Twelve Data API Integration...\n');

  // Test 1: Get Quote
  console.log('1. Testing Quote API...');
  const quote = await twelveDataService.getQuote('AAPL');
  console.log('Quote:', quote.success ? '✓ Success' : '✗ Failed');
  if (quote.success) {
    console.log(`   Price: $${quote.data.price}`);
    console.log(`   Change: ${quote.data.percentChange}%`);
  }
  console.log();

  // Test 2: Get Time Series
  console.log('2. Testing Time Series API...');
  const timeSeries = await twelveDataService.getTimeSeries('AAPL', '1day', 5);
  console.log('Time Series:', timeSeries.success ? '✓ Success' : '✗ Failed');
  if (timeSeries.success) {
    console.log(`   Records: ${timeSeries.data.length}`);
  }
  console.log();

  // Test 3: Get Profile
  console.log('3. Testing Profile API...');
  const profile = await twelveDataService.getProfile('AAPL');
  console.log('Profile:', profile.success ? '✓ Success' : '✗ Failed');
  if (profile.success) {
    console.log(`   Company: ${profile.data.name}`);
    console.log(`   Sector: ${profile.data.sector}`);
  }
  console.log();

  // Test 4: Search Stocks
  console.log('4. Testing Search API...');
  const search = await twelveDataService.searchStocks('Apple');
  console.log('Search:', search.success ? '✓ Success' : '✗ Failed');
  if (search.success) {
    console.log(`   Results: ${search.data.length}`);
  }
  console.log();

  console.log('All tests completed!');
  process.exit(0);
}

test().catch(console.error);