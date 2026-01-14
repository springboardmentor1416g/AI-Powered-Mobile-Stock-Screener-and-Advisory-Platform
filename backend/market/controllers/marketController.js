const yahooFinanceModule = require('yahoo-finance2');

// ✅ FIXED IMPORT (Robust loading)
let yahooFinance;
try {
    const YahooFinance = yahooFinanceModule.YahooFinance || yahooFinanceModule.default || yahooFinanceModule;
    yahooFinance = new YahooFinance();
} catch (err) {
    yahooFinance = yahooFinanceModule.default || yahooFinanceModule;
}

// ❌ REMOVED: yahooFinance.setGlobalConfig(...) to prevent crash.

// 1. Get Stock Details
const getStockDetails = async (req, res) => {
  const { ticker } = req.params;
  console.log(`📡 Real-Time Fetch: ${ticker}`);

  try {
    const quote = await yahooFinance.quote(ticker);
    const summary = await yahooFinance.quoteSummary(ticker, { modules: ['summaryProfile', 'financialData'] });

    if (!quote) return res.status(404).json({ error: "Stock not found" });

    res.json({
      ticker: ticker.toUpperCase(),
      name: quote.longName || quote.shortName || ticker,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChangePercent,
      market_cap: quote.marketCap,
      pe_ratio: quote.trailingPE,
      roe: summary.financialData?.returnOnEquity?.fmt || "N/A",
      description: summary.summaryProfile?.longBusinessSummary || "No description available.",
      sector: summary.summaryProfile?.sector,
      industry: summary.summaryProfile?.industry,
    });
    console.log(`✅ Success: ${ticker}`);

  } catch (err) {
    console.error(`❌ API FAILED for ${ticker}: ${err.message}`);
    res.status(500).json({ error: "Market Data Error", details: err.message });
  }
};

// 2. Get History
const getStockHistory = async (req, res) => {
  const { ticker } = req.params;
  try {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setFullYear(today.getFullYear() - 1); 

    const queryOptions = { period1: pastDate, period2: today, interval: '1d' };
    const result = await yahooFinance.historical(ticker, queryOptions);

    const chartData = result.map(day => ({
      timestamp: new Date(day.date).getTime(),
      value: day.close
    }));
    res.json(chartData);
  } catch (err) {
    console.error(`❌ Chart Error: ${err.message}`);
    res.status(500).json({ error: "Chart data unavailable" });
  }
};

module.exports = { getStockDetails, getStockHistory };