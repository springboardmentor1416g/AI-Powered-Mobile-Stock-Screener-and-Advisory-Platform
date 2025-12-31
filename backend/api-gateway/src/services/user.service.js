const bcrypt = require("bcryptjs");
const db = require("../config/db"); // your existing pg pool module

async function createUser(email, password) {
  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(password, salt);

  const q = `
    INSERT INTO users (email, password_hash, salt)
    VALUES ($1, $2, $3)
    RETURNING id, email, created_at
  `;
  const { rows } = await db.query(q, [email.toLowerCase(), password_hash, salt]);
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await db.query(`SELECT * FROM users WHERE email=$1`, [email.toLowerCase()]);
  return rows[0] || null;
}

async function updateLastLogin(userId) {
  await db.query(`UPDATE users SET last_login=NOW(), updated_at=NOW() WHERE id=$1`, [userId]);
}

module.exports = { createUser, findUserByEmail, updateLastLogin };
