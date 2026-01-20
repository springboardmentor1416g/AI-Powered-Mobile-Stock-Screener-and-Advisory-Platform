// src/middleware/trace.js
const { v4: uuidv4 } = require("uuid");

function traceMiddleware(req, res, next) {
  const traceId = req.headers["x-trace-id"] || uuidv4();
  req.traceId = traceId;

  // set header BEFORE response is sent
  res.setHeader("x-trace-id", traceId);

  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    // only log here, do NOT set headers here
    // logger.info({ traceId, ms, path: req.path, status: res.statusCode }, "request");
  });

  next();
}

module.exports = { traceMiddleware };