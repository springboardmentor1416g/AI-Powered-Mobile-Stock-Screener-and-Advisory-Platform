const express = require("express");
const router = express.Router();
const pool = require("../utils/db");

router.post("/", async (req, res) => {
  const { ticker, rule } = req.body;
  const userId = req.user.userId;

  if (!ticker || !rule) {
    return res.status(400).json({
      success: false,
      message: "Ticker and rule are required"
    });
  }
  await pool.query(
    `INSERT INTO public.alert_subscriptions (user_id, ticker, rule)
     VALUES ($1, $2, $3)`,
    [userId, ticker, rule]
  );

  res.json({ success: true });
});

router.get("/", async (req, res) => {
  const userId = req.user.userId;

  const { rows } = await pool.query(
    `SELECT ticker, rule, status FROM public.alert_subscriptions WHERE user_id=$1`,
    [userId]
  );

  res.json({ alerts: rows });
});

module.exports = router;
