/**
 * Authentication Middleware
 * Protects routes and validates JWT tokens
 */

const authService = require('../services/auth/auth_service');
const logger = require('../config/logger');

/**
 * Require authentication middleware
 * Validates JWT token and attaches user to request
 */
const requireAuth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      isActive: decoded.isActive,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);

      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          isActive: decoded.isActive,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user info if token is invalid
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
};
