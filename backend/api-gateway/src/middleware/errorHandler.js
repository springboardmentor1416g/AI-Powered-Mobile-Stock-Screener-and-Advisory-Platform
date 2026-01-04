module.exports = (err, req, res, next) => {
  res.status(400).json({
    success: false,
    message: err.message || "Invalid request",
    error_code: "BAD_REQUEST"
  });
};
