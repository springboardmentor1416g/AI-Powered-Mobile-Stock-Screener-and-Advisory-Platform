const pool = require("../../config/db");

// --- PORTFOLIO METHODS ---

// Get User's Portfolio
async function getPortfolio(req, res) {
  try {
    // In a real app, use req.user.id from auth middleware
    const { userId } = req.query; 

    const query = `
      SELECT p.name as portfolio_name, h.ticker, h.quantity, h.avg_buy_price, 
             c.name as company_name, c.sector, pr.close as current_price
      FROM portfolios p
      JOIN portfolio_holdings h ON p.id = h.portfolio_id
      JOIN companies c ON h.ticker = c.ticker
      LEFT JOIN price_history pr ON c.ticker = pr.ticker 
      WHERE p.user_id = $1
      ORDER BY pr.time DESC;
    `;
    
    // Note: The DISTINCT ON logic for price would be better here, 
    // but keeping it simple for this step.
    const result = await pool.query(query, [userId]);
    res.json({ success: true, holdings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// Add Stock to Portfolio
async function addToPortfolio(req, res) {
  try {
    const { userId, ticker, quantity, avgPrice } = req.body;

    // 1. Find or Create 'Main Portfolio' for user
    let portRes = await pool.query("SELECT id FROM portfolios WHERE user_id = $1", [userId]);
    let portfolioId;

    if (portRes.rows.length === 0) {
      const newPort = await pool.query(
        "INSERT INTO portfolios (user_id) VALUES ($1) RETURNING id", 
        [userId]
      );
      portfolioId = newPort.rows[0].id;
    } else {
      portfolioId = portRes.rows[0].id;
    }

    // 2. Insert Holding
    await pool.query(
      `INSERT INTO portfolio_holdings (portfolio_id, ticker, quantity, avg_buy_price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (portfolio_id, ticker) 
       DO UPDATE SET quantity = $3, avg_buy_price = $4`,
      [portfolioId, ticker, quantity, avgPrice]
    );

    res.json({ success: true, message: "Stock added to portfolio" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getPortfolio, addToPortfolio };