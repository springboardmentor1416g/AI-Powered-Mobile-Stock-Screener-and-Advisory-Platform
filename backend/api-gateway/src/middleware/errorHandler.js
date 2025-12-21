const logger = require('../config/logger');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message, errorCode } = err;
  
  // Log error
  logger.error('Error occurred', {
    traceId: req.traceId,
    method: req.method,
    url: req.url,
    statusCode,
    errorCode,
    message: err.message,
    stack: err.stack,
  });

  // Determine error response
  const response = {
    success: false,
    message: err.isOperational ? message : 'Internal server error',
    error_code: errorCode || (statusCode === 400 ? 'BAD_REQUEST' :
                             statusCode === 401 ? 'UNAUTHORIZED' :
                             statusCode === 403 ? 'FORBIDDEN' :
                             statusCode === 404 ? 'NOT_FOUND' :
                             statusCode === 429 ? 'TOO_MANY_REQUESTS' :
                             'INTERNAL_SERVER_ERROR'),
    trace_id: req.traceId,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND');
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
