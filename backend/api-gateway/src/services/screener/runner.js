const { compileDsl } = require("../dsl/compiler");
const { computeDerivedMetrics } = require("../metrics/derivedMetrics");

async function runScreener({ dsl, limit = 200 }) {
  // Mock data with realistic variations
  const mockStocks = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      sector: "Technology",
      exchange: "NASDAQ",
      price: 182.45,
      marketCap: 2800000000000,
      pe_ratio: 29.1,
      peg_ratio: 1.5,
      debt_to_fcf: 0.5,
      revenue: 365000000000,
      ebitda: 120000000000,
      free_cash_flow: 100000000000,
      promoter_holding: 0.05,
      net_profit: 95000000000,
      roe: 0.25,
      roa: 0.18,
      total_debt: 100000000000,
      revenue_growth_yoy: 0.1,
      earnings_growth_yoy: 0.15
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      sector: "Technology",
      exchange: "NASDAQ",
      price: 412.30,
      marketCap: 3100000000000,
      pe_ratio: 34.8,
      peg_ratio: 2.0,
      debt_to_fcf: 0.3,
      revenue: 245000000000,
      ebitda: 100000000000,
      free_cash_flow: 80000000000,
      promoter_holding: 0.02,
      net_profit: 78000000000,
      roe: 0.30,
      roa: 0.22,
      total_debt: 50000000000,
      revenue_growth_yoy: 0.12,
      earnings_growth_yoy: 0.18
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      sector: "Technology",
      exchange: "NASDAQ",
      price: 140.50,
      marketCap: 1800000000000,
      pe_ratio: 25.5,
      peg_ratio: 1.8,
      debt_to_fcf: 0.2,
      revenue: 307000000000,
      ebitda: 95000000000,
      free_cash_flow: 70000000000,
      promoter_holding: 0.10,
      net_profit: 60000000000,
      roe: 0.20,
      roa: 0.15,
      total_debt: 30000000000,
      revenue_growth_yoy: 0.08,
      earnings_growth_yoy: 0.10
    },
    {
      symbol: "JPM",
      name: "JPMorgan Chase & Co.",
      sector: "Financial",
      exchange: "NYSE",
      price: 198.75,
      marketCap: 550000000000,
      pe_ratio: 12.5,
      peg_ratio: 1.1,
      debt_to_fcf: 0.8,
      revenue: 135000000000,
      ebitda: 60000000000,
      free_cash_flow: 45000000000,
      promoter_holding: 0.15,
      net_profit: 48000000000,
      roe: 0.12,
      roa: 0.08,
      total_debt: 80000000000,
      revenue_growth_yoy: 0.05,
      earnings_growth_yoy: 0.08
    },
    {
      symbol: "JNJ",
      name: "Johnson & Johnson",
      sector: "Healthcare",
      exchange: "NYSE",
      price: 155.25,
      marketCap: 420000000000,
      pe_ratio: 18.2,
      peg_ratio: 1.3,
      debt_to_fcf: 0.4,
      revenue: 94000000000,
      ebitda: 32000000000,
      free_cash_flow: 28000000000,
      promoter_holding: 0.08,
      net_profit: 22000000000,
      roe: 0.22,
      roa: 0.16,
      total_debt: 28000000000,
      revenue_growth_yoy: 0.06,
      earnings_growth_yoy: 0.09
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      sector: "Consumer Cyclical",
      exchange: "NASDAQ",
      price: 245.85,
      marketCap: 780000000000,
      pe_ratio: 52.3,
      peg_ratio: 2.8,
      debt_to_fcf: 0.1,
      revenue: 81500000000,
      ebitda: 18000000000,
      free_cash_flow: 13000000000,
      promoter_holding: 0.20,
      net_profit: 12800000000,
      roe: 0.18,
      roa: 0.12,
      total_debt: 5000000000,
      revenue_growth_yoy: 0.25,
      earnings_growth_yoy: 0.35
    }
  ];

  // Compute derived metrics for all stocks
  const stocksWithMetrics = mockStocks.map(r => ({
    ...r,
    ...computeDerivedMetrics(r)
  }));

  // Compile and apply DSL filter
  const compiledFilter = compileDsl(dsl);
  const filtered = stocksWithMetrics
    .filter(stock => {
      try {
        return compiledFilter(stock);
      } catch (e) {
        return true; // Include stock if filter fails
      }
    })
    .slice(0, limit);

  return filtered;
} 

module.exports = { runScreener };