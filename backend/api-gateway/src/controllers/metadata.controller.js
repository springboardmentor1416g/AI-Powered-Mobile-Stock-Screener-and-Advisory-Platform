const { getPool } = require("../config/db");

async function listStocks(req, res, next) {
  try {
    // If DB is available, return real data
    const pool = getPool();
    const result = await pool.query(
      `SELECT ticker AS symbol, name, sector, exchange
       FROM companies
       ORDER BY ticker
       LIMIT 200`
    );

    res.json(result.rows);
  } catch (err) {
    // fallback to mock response if DB fails
    // (still send consistent output)
    res.json([
      { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", exchange: "NASDAQ" },
      { symbol: "MSFT", name: "Microsoft", sector: "Technology", exchange: "NASDAQ" },
    ]);
  }
}

module.exports = { listStocks };
