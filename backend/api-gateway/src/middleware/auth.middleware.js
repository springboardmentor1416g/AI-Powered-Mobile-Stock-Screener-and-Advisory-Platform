const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
<<<<<<< HEAD
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
=======
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    res.status(401).json({ message: "Invalid token" });
  }
};
