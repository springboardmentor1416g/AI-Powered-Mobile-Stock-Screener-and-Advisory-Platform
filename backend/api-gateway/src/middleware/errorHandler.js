<<<<<<< HEAD
module.exports = (err, req, res, next) => {
  res.status(400).json({
    success: false,
    message: err.message || "Invalid request",
    error_code: "BAD_REQUEST"
  });
};
=======
export default function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.traceId}:`, err.message);

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error_code: "SERVER_ERROR",
    trace_id: req.traceId
  });
}
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
