const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/db');

require('dotenv').config();

/**
 * SIGNUP
 */
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert user
    await pool.query(
      `INSERT INTO users (id, email, password_hash)
       VALUES ($1, $2, $3)`,
      [uuidv4(), email, passwordHash]
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * LOGIN
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Fetch user
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // 2. Compare password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY }
    );

    // 4. Update last login
    await pool.query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    res.json({
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
