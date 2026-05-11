const fs = require("fs");
const path = require("path");
const { getPool } = require("./db");
const logger = require("../utils/logger");

const mockPath = path.resolve(__dirname, "..", "..", "src", "utils", "mock_stocks.json");

async function getStocksFromDb(limit = 1000) {
  const pool = getPool();
  const q = `
    SELECT ticker AS symbol, name, sector, exchange
    FROM companies
    ORDER BY ticker
    LIMIT $1;
  `;
  const { rows } = await pool.query(q, [limit]);
  return rows;
}

function getStocksFromMock() {
  if (!fs.existsSync(mockPath)) {
    return [
      { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", exchange: "NASDAQ" },
      { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", exchange: "NASDAQ" }
    ];
  }
  return JSON.parse(fs.readFileSync(mockPath, "utf-8"));
}

async function listStocks({ useMock, limit }) {
  if (useMock) return getStocksFromMock();

  try {
    return await getStocksFromDb(limit);
  } catch (e) {
    logger.warn("DB metadata read failed; falling back to mock", { error: e.message });
    return getStocksFromMock();
  }
}

module.exports = { listStocks };