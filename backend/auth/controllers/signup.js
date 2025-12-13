const pool = require("../../config/db/index.js");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(`
      INSERT INTO users (id, email, password_hash)
      VALUES ($1, $2, $3)
    `, [id, email, hashed]);

    res.json({ success: true, message: "User created successfully" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
