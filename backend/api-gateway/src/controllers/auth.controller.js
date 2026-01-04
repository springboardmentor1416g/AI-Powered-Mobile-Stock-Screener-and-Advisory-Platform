const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
<<<<<<< HEAD
const { v4: uuidv4 } = require("uuid");
=======
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
const pool = require("../config/db");

exports.signup = async (req, res) => {
  const { email, password } = req.body;

<<<<<<< HEAD
  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)",
    [uuidv4(), email, hashedPassword]
  );

  res.json({ success: true, message: "User registered successfully" });
=======
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ message: "User already exists" });
  }
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
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
<<<<<<< HEAD
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
=======
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
<<<<<<< HEAD
    process.env.JWT_SECRET_KEY,
=======
    process.env.JWT_SECRET,
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    { expiresIn: process.env.TOKEN_EXPIRY }
  );

  res.json({ token });
};
