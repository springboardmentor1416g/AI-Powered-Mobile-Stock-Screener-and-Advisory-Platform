const yahooFinanceModule = require('yahoo-finance2');

// 1. ROBUST IMPORT (Fixes the "new YahooFinance()" error)
// We try to find the Class Constructor and create a new instance manually.
let yahooFinance;
try {
    // Attempt to grab the Class definition
    const YahooFinance = yahooFinanceModule.YahooFinance || yahooFinanceModule.default || yahooFinanceModule;
    yahooFinance = new YahooFinance(); 
} catch (err) {
    // If 'new' fails, it means we already have an instance (fallback)
    yahooFinance = yahooFinanceModule.default || yahooFinanceModule;
}

// 2. Suppress console spam (optional)
if (yahooFinance.suppressNotices) {
    yahooFinance.suppressNotices(['yahooSurvey']);
}

async function testConnection() {
  console.log("📡 Testing Connection to Yahoo Finance...");
  try {
    const result = await yahooFinance.quote('AAPL');
    
    if (result) {
        console.log("✅ SUCCESS! Real Data Received:");
        console.log(`   Ticker: ${result.symbol}`);
        console.log(`   Price: $${result.regularMarketPrice}`);
    } else {
        console.log("❌ Failed: No data returned.");
    }

  } catch (error) {
    console.log("❌ CONNECTION ERROR:");
    console.log(error.message);
  }
}

testConnection();