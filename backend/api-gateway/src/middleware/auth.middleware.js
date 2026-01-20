const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [type, token] = auth.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Missing token", error_code: "UNAUTHORIZED" });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token", error_code: "UNAUTHORIZED" });
  }
}

module.exports = { requireAuth };