const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

exports.signup = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)",
    [uuidv4(), email, hashedPassword]
  );

  res.json({ success: true, message: "User registered successfully" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.TOKEN_EXPIRY }
  );

  res.json({ token });
};
