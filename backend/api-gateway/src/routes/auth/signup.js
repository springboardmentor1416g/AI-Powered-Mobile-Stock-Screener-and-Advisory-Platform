const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const router = express.Router();
const pool = require("../../utils/db"); // create DB helper next

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, email, password_hash)
       VALUES ($1, $2, $3)`,
      [crypto.randomUUID(), email, hashed]
    );

    res.json({ success: true, message: "User created" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
