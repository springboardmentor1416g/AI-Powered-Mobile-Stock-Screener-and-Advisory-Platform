console.log("Notifications route file loaded");

const express = require("express");
const router = express.Router();
const pool = require("../utils/db");

// Get notifications for logged-in user
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { rows } = await pool.query(
      `SELECT id, message, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ notifications: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
