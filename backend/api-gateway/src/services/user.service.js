import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const SALT_ROUNDS = 10;

/**
 * Create new user
 */
export async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, created_at`,
    [email, passwordHash]
  );

  return result.rows[0];
}

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0];
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId) {
  await pool.query(
    `UPDATE users SET last_login = NOW() WHERE id = $1`,
    [userId]
  );
}
