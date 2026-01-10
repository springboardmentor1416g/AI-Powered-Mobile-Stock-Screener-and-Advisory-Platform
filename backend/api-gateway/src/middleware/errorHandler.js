// backend/api-gateway/src/middleware/errorHandler.js
const logger = require("../utils/logger");

module.exports = function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  logger.error({ err, traceId: req.traceId }, "error");

  res.status(status).json({
    success: false,
    message: err.message || "Server error",
    error_code: err.code || (status === 400 ? "BAD_REQUEST" : "SERVER_ERROR"),
    trace_id: req.traceId,
  });
};
