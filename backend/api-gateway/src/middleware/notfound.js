function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error_code: "NOT_FOUND",
  });
}

module.exports = notFound;