module.exports = (err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error_code: err.code || 'SERVER_ERROR',
    trace_id: req.traceId
  });
};
