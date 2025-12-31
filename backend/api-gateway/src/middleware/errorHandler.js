const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  logger.error({ err, traceId: req.traceId }, "Unhandled error");

  if (res.headersSent) return next(err);

  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error_code: err.errorCode || "SERVER_ERROR",
    trace_id: req.traceId,
  });
}

module.exports = errorHandler;
