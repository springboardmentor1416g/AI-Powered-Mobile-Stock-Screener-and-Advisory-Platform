const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
  try {
    const header = req.headers["authorization"] || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ success: false, message: "Missing Bearer token", error_code: "UNAUTHORIZED" });
    }

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) throw new Error("JWT_SECRET_KEY missing in env");

    const payload = jwt.verify(token, secret);
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid/expired token", error_code: "UNAUTHORIZED" });
  }
};