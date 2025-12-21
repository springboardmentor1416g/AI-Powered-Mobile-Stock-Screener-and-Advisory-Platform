const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiter middleware
 * Prevents abuse by limiting requests per IP
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error_code: 'TOO_MANY_REQUESTS',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = rateLimiter;
