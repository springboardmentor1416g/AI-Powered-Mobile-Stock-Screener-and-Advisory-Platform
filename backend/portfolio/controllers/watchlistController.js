const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

const yahooFinanceModule = require('yahoo-finance2');

// ✅ FIXED IMPORT: Matches the fix in marketController.js
let yahooFinance;
try {
    const YahooFinance = yahooFinanceModule.YahooFinance || yahooFinanceModule.default || yahooFinanceModule;
    yahooFinance = new YahooFinance();
} catch (err) {
    yahooFinance = yahooFinanceModule.default || yahooFinanceModule;
}

// 1. Add Stock to Watchlist
const addToWatchlist = async (req, res) => {
  const { userId, ticker } = req.body;

  if (!userId || !ticker) {
    return res.status(400).json({ error: "Missing userId or ticker" });
  }

  try {
    const id = uuidv4();
    const query = `
      INSERT INTO public.watchlist (id, user_id, ticker, added_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, ticker) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [id, userId, ticker]);

    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, message: "Stock is already in your watchlist" });
    }
    res.status(201).json({ success: true, message: "Added to watchlist", data: result.rows[0] });

  } catch (err) {
    console.error("❌ Add Watchlist Error:", err.message);
    res.status(500).json({ error: "Server Database Error" });
  }
};

// 2. Get User's Watchlist (REAL DATA)
const getWatchlist = async (req, res) => {
  const { userId } = req.params;

  try {
    // A. Get tickers from DB
    const query = `SELECT ticker FROM public.watchlist WHERE user_id = $1 ORDER BY added_at DESC;`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) return res.json([]);

    // B. Fetch REAL data for all
    const promises = result.rows.map(async (row) => {
      try {
        const quote = await yahooFinance.quote(row.ticker);
        return {
          ticker: row.ticker,
          name: quote.longName || quote.shortName || row.ticker,
          current_price: quote.regularMarketPrice,
          change: quote.regularMarketChangePercent
        };
      } catch (err) {
        console.error(`⚠️ Failed to fetch ${row.ticker}: ${err.message}`);
        // Return Error State (This shows '0' so you know it failed)
        return {
          ticker: row.ticker,
          name: "Data Unavailable",
          current_price: 0,
          change: 0
        };
      }
    });

    const liveWatchlist = await Promise.all(promises);
    res.status(200).json(liveWatchlist);

  } catch (err) {
    console.error("❌ Watchlist Error:", err.message);
    res.status(500).json({ error: "Database Error" });
  }
};

// 3. Remove from Watchlist
const removeFromWatchlist = async (req, res) => {
  const { userId, ticker } = req.body;
  try {
    const query = `
      DELETE FROM public.watchlist 
      WHERE user_id = $1 AND ticker = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, ticker]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found in watchlist" });
    }
    res.json({ success: true, message: "Removed from watchlist" });
  } catch (err) {
    console.error("❌ Remove Watchlist Error:", err.message);
    res.status(500).json({ error: "Server Database Error" });
  }
};

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist
};