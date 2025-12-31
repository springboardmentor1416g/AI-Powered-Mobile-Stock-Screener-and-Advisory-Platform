const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");

const { pool } = require("../config/db");

function signToken(payload) {
  const secret = process.env.JWT_SECRET_KEY;
  const expiresIn = process.env.TOKEN_EXPIRY || "7d";
  if (!secret) throw new Error("JWT_SECRET_KEY missing in env");
  return jwt.sign(payload, secret, { expiresIn });
}

exports.signup = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required", error_code: "BAD_REQUEST" });
    }
    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ success: false, message: "Invalid email format", error_code: "BAD_REQUEST" });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters", error_code: "BAD_REQUEST" });
    }

    // check existing
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email.toLowerCase()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ success: false, message: "Email already registered", error_code: "CONFLICT" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const id = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password_hash, salt)
       VALUES ($1, $2, $3, $4)`,
      [id, email.toLowerCase(), password_hash, salt]
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: { id, email: email.toLowerCase() }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required", error_code: "BAD_REQUEST" });
    }

    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email=$1",
      [String(email).toLowerCase()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials", error_code: "UNAUTHORIZED" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials", error_code: "UNAUTHORIZED" });
    }

    await pool.query("UPDATE users SET last_login=NOW(), updated_at=NOW() WHERE id=$1", [user.id]);

    const token = signToken({ userId: user.id, email: user.email });

    return res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    // req.user is set by requireAuth middleware
    return res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};
