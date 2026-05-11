function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error_code: "NOT_FOUND",
  });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server error",
    error_code: err.errorCode || "SERVER_ERROR",
    trace_id: req.traceId,
  });
}

module.exports = { notFound, errorHandler };