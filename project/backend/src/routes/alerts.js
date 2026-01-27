/**
 * Alerts Routes
 * Handles alert subscriptions and notifications
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const alertEngine = require('../services/alerts/alert_engine');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/v1/alerts
 * Create a new alert
 */
router.post(
  '/',
  requireAuth,
  [
    body('ticker').optional().trim(),
    body('alertName').notEmpty().trim(),
    body('alertType').isIn(['price', 'fundamental', 'technical', 'earnings']),
    body('condition').notEmpty(),
    body('frequency').optional().isIn(['realtime', 'daily', 'weekly']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const alertData = {
        userId: req.user.userId,
        ticker: req.body.ticker,
        alertName: req.body.alertName,
        alertType: req.body.alertType,
        condition: req.body.condition,
        frequency: req.body.frequency || 'daily',
      };

      const result = await alertEngine.createAlert(alertData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/alerts
 * Get user's alerts
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await alertEngine.getUserAlerts(req.user.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/v1/alerts/:id
 * Toggle alert active status
 */
router.patch(
  '/:id',
  requireAuth,
  [body('isActive').isBoolean()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const alertId = parseInt(req.params.id);
      const { isActive } = req.body;

      const result = await alertEngine.toggleAlert(alertId, req.user.userId, isActive);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * DELETE /api/v1/alerts/:id
 * Delete an alert
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const result = await alertEngine.deleteAlert(alertId, req.user.userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/alerts/notifications
 * Get user's notifications
 */
router.get(
  '/notifications',
  requireAuth,
  [query('unreadOnly').optional().isBoolean()],
  async (req, res) => {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      const result = await alertEngine.getUserNotifications(req.user.userId, unreadOnly);

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * PATCH /api/v1/alerts/notifications/:id/read
 * Mark notification as read
 */
router.patch('/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const result = await alertEngine.markAsRead(notificationId, req.user.userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
