const express = require("express");
const router = express.Router();
const pool = require("../utils/db");

// Add stock
router.post("/", async (req, res) => {
  const { ticker, quantity } = req.body;
  const userId = req.user.userId;

  if (!ticker || ticker.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Ticker is required"
    });
  }

  // 1️⃣ Ensure portfolio exists for user
  await pool.query(
    `INSERT INTO public.user_portfolios (user_id)
     VALUES ($1)
     ON CONFLICT DO NOTHING`,
    [userId]
  );

  // 2️⃣ Get portfolio id
  const { rows } = await pool.query(
    `SELECT id FROM public.user_portfolios WHERE user_id = $1`,
    [userId]
  );

  const portfolioId = rows[0].id;

  // 3️⃣ Insert or update holding
  await pool.query(
    `INSERT INTO public.portfolio_holdings (portfolio_id, ticker, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (portfolio_id, ticker)
     DO UPDATE SET quantity = EXCLUDED.quantity`,
    [portfolioId, ticker, quantity]
  );

  res.json({ success: true });
});


// Get portfolio
router.get("/", async (req, res) => {
  const userId = req.user.userId;

  const { rows } = await pool.query(
    `SELECT ticker, quantity FROM public.portfolio_holdings
     WHERE portfolio_id = (SELECT id FROM public.user_portfolios WHERE user_id=$1)`,
    [userId]
  );

  res.json({ portfolio: rows });
});

module.exports = router;



