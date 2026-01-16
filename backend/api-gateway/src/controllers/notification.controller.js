const notificationService = require('../services/notification.service');

/**
 * Get user notifications
 * GET /api/v1/notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 50, offset = 0 } = req.query;

    const notifications = await notificationService.getUserNotifications(userId, {
      status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get counts
    const counts = await notificationService.getNotificationCounts(userId);

    res.json({
      success: true,
      data: notifications,
      counts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: notifications.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification by ID
 * GET /api/v1/notifications/:notificationId
 */
exports.getNotification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    // Fetch single notification
    const { Pool } = require('pg');
    require('dotenv').config();
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    const result = await pool.query(
      `SELECT * FROM notifications WHERE id = $1 AND user_id = $2`,
      [parseInt(notificationId), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        error_code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PATCH /api/v1/notifications/:notificationId/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(
      userId,
      parseInt(notificationId)
    );

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/v1/notifications/mark-all-read
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dismiss notification
 * DELETE /api/v1/notifications/:notificationId/dismiss
 */
exports.dismissNotification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const notification = await notificationService.dismissNotification(
      userId,
      parseInt(notificationId)
    );

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 * DELETE /api/v1/notifications/:notificationId
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const notification = await notificationService.deleteNotification(
      userId,
      parseInt(notificationId)
    );

    res.json({
      success: true,
      message: 'Notification deleted',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification counts
 * GET /api/v1/notifications/counts
 */
exports.getNotificationCounts = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const counts = await notificationService.getNotificationCounts(userId);

    res.json({
      success: true,
      data: counts
    });
  } catch (error) {
    next(error);
  }
};
