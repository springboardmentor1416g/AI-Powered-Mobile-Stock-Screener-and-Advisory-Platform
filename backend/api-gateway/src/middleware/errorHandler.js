export default function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.traceId}:`, err.message);

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error_code: "SERVER_ERROR",
    trace_id: req.traceId
  });
}
