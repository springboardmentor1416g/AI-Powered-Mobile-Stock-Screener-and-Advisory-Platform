const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/auth.middleware');
const notificationController = require('../controllers/notification.controller');

// All notification routes require authentication
router.use(authMiddleware);

// Get notifications
router.get('/', notificationController.getNotifications);

// Get notification counts
router.get('/counts', notificationController.getNotificationCounts);

// Get single notification
router.get('/:notificationId', notificationController.getNotification);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Dismiss notification
router.delete('/:notificationId/dismiss', notificationController.dismissNotification);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
