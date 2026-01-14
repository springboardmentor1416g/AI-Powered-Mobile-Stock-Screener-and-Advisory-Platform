const pool = require('../../config/db'); // Ensure this path points to your db config

const getPortfolio = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch portfolio items for the user
    // Assumes you have a 'user_portfolio' table. If not, this returns []
    const query = `
      SELECT * FROM user_portfolio 
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);

    // If you don't have the table yet, mock the response so the frontend doesn't crash
    if (!result) {
        return res.json([
            { ticker: "AAPL", quantity: 10, avg_buy_price: 145.00 },
            { ticker: "MSFT", quantity: 5, avg_buy_price: 300.00 }
        ]);
    }

    res.json(result.rows);

  } catch (err) {
    console.error("Portfolio Fetch Error:", err.message);
    
    // Fallback: Send mock data if DB table is missing (prevents App Crash)
    if (err.code === '42P01') { // Postgres error for "table does not exist"
        return res.json([]); 
    }
    
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  getPortfolio
};