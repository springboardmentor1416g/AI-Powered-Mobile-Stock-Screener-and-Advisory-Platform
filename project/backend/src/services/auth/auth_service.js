/**
 * Authentication Service
 * Handles user registration, login, and JWT token management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/database');
const logger = require('../../config/logger');
const config = require('../../config/environment');

class AuthService {
  constructor() {
    this.jwtSecret = config.JWT_SECRET;
    this.jwtExpiry = config.JWT_EXPIRY;
    this.saltRounds = 10;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration result
   */
  async register(userData) {
    try {
      const { email, password, firstName, lastName } = userData;

      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, this.saltRounds);

      // Insert user
      const query = `
        INSERT INTO users (email, password_hash, first_name, last_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, first_name, last_name, created_at, is_active
      `;

      const values = [
        email.toLowerCase(),
        passwordHash,
        firstName || null,
        lastName || null,
      ];

      const result = await db.query(query, values);
      const user = result.rows[0];

      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
      });

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Login user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Promise<Object>} - Login result
   */
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw new Error('Account is disabled');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await db.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
      });

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      logger.error('Error logging in:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Object} - Decoded token data or null
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      logger.error('Error verifying token:', error);
      return null;
    }
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {String} - JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      isActive: user.is_active,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry,
    });
  }

  /**
   * Refresh JWT token
   * @param {String} token - Old JWT token
   * @returns {Promise<Object>} - New token or error
   */
  async refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);

      if (!decoded) {
        throw new Error('Invalid token');
      }

      // Get fresh user data
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1 AND is_active = TRUE',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found or inactive');
      }

      const user = result.rows[0];
      const newToken = this.generateToken(user);

      return {
        success: true,
        token: newToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      logger.error('Error refreshing token:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user by ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - User data
   */
  async getUserById(userId) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: this.sanitizeUser(result.rows[0]),
      };
    } catch (error) {
      logger.error('Error getting user:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated user data
   */
  async updateProfile(userId, updates) {
    try {
      const allowedFields = ['first_name', 'last_name'];
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, first_name, last_name, created_at, updated_at, is_active
      `;

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      logger.info('User profile updated', {
        userId,
        fields: Object.keys(updates),
      });

      return {
        success: true,
        user: this.sanitizeUser(result.rows[0]),
      };
    } catch (error) {
      logger.error('Error updating profile:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Promise<Object>} - Result
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Current and new password are required');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      // Get user
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);

      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await db.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, userId]
      );

      logger.info('User password changed', { userId });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      logger.error('Error changing password:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Request password reset (generate reset token)
   * @param {String} email - User email
   * @returns {Promise<Object>} - Reset token (in production, send via email)
   */
  async requestPasswordReset(email) {
    try {
      const result = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        // Don't reveal if user exists
        return {
          success: true,
          message: 'If the email exists, a reset link has been sent',
        };
      }

      const user = result.rows[0];

      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      logger.info('Password reset requested', {
        userId: user.id,
        email,
      });

      // In production, send resetToken via email
      // For now, return it (development only)
      return {
        success: true,
        message: 'If the email exists, a reset link has been sent',
        resetToken, // Remove this in production
      };
    } catch (error) {
      logger.error('Error requesting password reset:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reset password with token
   * @param {String} resetToken - Reset token
   * @param {String} newPassword - New password
   * @returns {Promise<Object>} - Result
   */
  async resetPassword(resetToken, newPassword) {
    try {
      if (!resetToken || !newPassword) {
        throw new Error('Reset token and new password are required');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Verify reset token
      const decoded = jwt.verify(resetToken, this.jwtSecret);

      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid reset token');
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      const result = await db.query(
        `UPDATE users 
         SET password_hash = $1, updated_at = NOW() 
         WHERE id = $2 AND is_active = TRUE
         RETURNING id`,
        [passwordHash, decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found or inactive');
      }

      logger.info('Password reset successfully', {
        userId: decoded.userId,
      });

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      logger.error('Error resetting password:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Remove sensitive data from user object
   * @param {Object} user - User object
   * @returns {Object} - Sanitized user object
   */
  sanitizeUser(user) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = new AuthService();
