const db = require("../config/db");

const createUser = async (email, passwordHash) => {
  const query = `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email
  `;
  const result = await db.query(query, [email, passwordHash]);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

module.exports = { createUser, findUserByEmail };
