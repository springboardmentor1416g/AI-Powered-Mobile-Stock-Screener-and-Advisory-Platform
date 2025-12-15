const pool = require('../config/db');

exports.createUser = async (email, passwordHash) => {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id`,
    [email, passwordHash]
  );

  return result.rows[0];
};
