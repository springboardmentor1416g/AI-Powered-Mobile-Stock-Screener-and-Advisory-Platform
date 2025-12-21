const { v4: uuidv4 } = require("uuid");

module.exports = (req, res, next) => {
  req.traceId = uuidv4();
  console.log(`[${req.traceId}] ${req.method} ${req.originalUrl}`);
  next();
};
