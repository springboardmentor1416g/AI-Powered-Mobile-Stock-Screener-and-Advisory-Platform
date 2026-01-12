const express = require("express");
const router = express.Router();
const pool = require("../utils/db");

router.post("/", async (req, res) => {
  const { ticker } = req.body;
  const userId = req.user.userId;

  await pool.query(
    `INSERT INTO public.watchlist_items (watchlist_id, ticker)
     VALUES (
       (SELECT id FROM public.watchlists WHERE user_id=$1 LIMIT 1),
       $2
     )`,
    [userId, ticker]
  );

  res.json({ success: true });
});

router.get("/", async (req, res) => {
  const userId = req.user.userId;

  const { rows } = await pool.query(
    `SELECT ticker FROM public.watchlist_items
     WHERE watchlist_id = (SELECT id FROM public.watchlists WHERE user_id=$1)`,
    [userId]
  );

  res.json({ watchlist: rows });
});

module.exports = router;
