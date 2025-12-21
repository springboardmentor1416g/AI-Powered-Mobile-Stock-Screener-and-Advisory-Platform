const pool = require("../config/db");

exports.add = async (req, res, next) => {
  const { ticker } = req.body;
  const userId = req.user.userId;

  await pool.query(
    "INSERT INTO watchlists (user_id, ticker) VALUES ($1, $2)",
    [userId, ticker]
  );

  res.json({ success: true, message: "Added to watchlist" });
};

exports.list = async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query(
    "SELECT ticker FROM watchlists WHERE user_id=$1",
    [userId]
  );

  res.json(result.rows);
};

exports.remove = async (req, res) => {
  const userId = req.user.userId;
  const { ticker } = req.params;

  await pool.query(
    "DELETE FROM watchlists WHERE user_id=$1 AND ticker=$2",
    [userId, ticker]
  );

  res.json({ success: true, message: "Removed from watchlist" });
};
