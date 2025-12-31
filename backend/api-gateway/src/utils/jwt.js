const jwt = require("jsonwebtoken");

function signToken(payload) {
  const secret = process.env.JWT_SECRET_KEY;
  const expiresIn = process.env.TOKEN_EXPIRY || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET_KEY;
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
