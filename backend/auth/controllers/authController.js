const pool = require("../../config/db");
// Simple "fake" hashing for now to keep it simple. 
// In production, use 'bcrypt' library.
const crypto = require("crypto"); 

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 1. REGISTER
async function register(req, res) {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const check = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Insert new user
    // We generate a UUID for the ID using Postgres function gen_random_uuid()
    const result = await pool.query(
      "INSERT INTO users (id, email, password_hash) VALUES (gen_random_uuid(), $1, $2) RETURNING id, email",
      [email, hashPassword(password)]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// 2. LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];
    
    // Verify Password
    if (user.password_hash !== hashPassword(password)) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Success! Return the User ID (Frontend will save this)
    res.json({ 
      success: true, 
      user: { id: user.id, email: user.email } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login };