const logger = require("../utils/logger");

function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error_code: "NOT_FOUND",
    trace_id: req.traceId,
  });
}

function errorHandler(err, req, res, next) {
  logger.error({ err, traceId: req.traceId }, "Unhandled error");

  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error_code: err.code || "INTERNAL_ERROR",
    trace_id: req.traceId,
  });
}

module.exports = { notFound, errorHandler };
