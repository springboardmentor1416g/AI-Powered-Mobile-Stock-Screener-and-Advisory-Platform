const pool = require('../../config/db'); // Adjust this path to point to your db connection file!
const { v4: uuidv4 } = require('uuid');

// 1. Add Stock to Watchlist
const addToWatchlist = async (req, res) => {
  const { userId, ticker } = req.body;

  if (!userId || !ticker) {
    return res.status(400).json({ error: "Missing userId or ticker" });
  }

  try {
    const id = uuidv4();
    
    // Insert into DB
    const query = `
      INSERT INTO public.watchlist (id, user_id, ticker, added_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, ticker) DO NOTHING
      RETURNING *;
    `;

    const result = await pool.query(query, [id, userId, ticker]);

    if (result.rows.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "Stock is already in your watchlist" 
      });
    }

    res.status(201).json({ 
      success: true, 
      message: "Added to watchlist", 
      data: result.rows[0] 
    });

  } catch (err) {
    console.error("❌ Add Watchlist Error:", err.message);
    res.status(500).json({ error: "Server Database Error" });
  }
};

// 2. Fetch User's Watchlist
const getWatchlist = async (req, res) => {
  const { userId } = req.params;

  try {
    // Basic query to get tickers. Join with stock data if you have a 'stocks' table.
    const query = `
      SELECT id, ticker, added_at 
      FROM public.watchlist 
      WHERE user_id = $1 
      ORDER BY added_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    // Format the response (Mocking price data for now since we don't have a live feed here)
    const formattedData = result.rows.map(row => ({
      ticker: row.ticker,
      name: row.ticker, // Placeholder
      current_price: 150.00, // Placeholder
      change: 1.5 // Placeholder
    }));

    res.status(200).json(formattedData);

  } catch (err) {
    console.error("❌ Fetch Watchlist Error:", err.message);
    res.status(500).json({ error: "Server Database Error" });
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