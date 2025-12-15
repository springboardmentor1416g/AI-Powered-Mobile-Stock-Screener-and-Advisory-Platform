module.exports = (err, req, res, next) => {
  console.error('ERROR:', err.message);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error_code: 'SERVER_ERROR',
    trace_id: req.traceId
  });
};
