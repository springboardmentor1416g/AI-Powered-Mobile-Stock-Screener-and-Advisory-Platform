const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Create notification from alert trigger
 */
async function createNotification(userId, triggerId, title, message, alertType, ticker) {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, trigger_id, title, message, alert_type, ticker, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'unread')
       RETURNING id, user_id, trigger_id, title, message, alert_type, ticker, status, created_at`,
      [userId, triggerId, title, message, alertType, ticker]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Get user notifications
 */
async function getUserNotifications(userId, options = {}) {
  const { status, limit = 50, offset = 0 } = options;
  
  let query = `
    SELECT 
      id, user_id, trigger_id, title, message, alert_type, ticker, 
      status, created_at, read_at
    FROM notifications
    WHERE user_id = $1
  `;
  
  const params = [userId];
  let paramIndex = 2;
  
  if (status) {
    query += ` AND status = $${paramIndex++}`;
    params.push(status);
  }
  
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get notification count by status
 */
async function getNotificationCounts(userId) {
  const result = await pool.query(
    `SELECT 
      status,
      COUNT(*) as count
    FROM notifications
    WHERE user_id = $1
    GROUP BY status`,
    [userId]
  );

  const counts = {
    unread: 0,
    read: 0,
    dismissed: 0
  };

  result.rows.forEach(row => {
    counts[row.status] = parseInt(row.count);
  });

  return counts;
}

/**
 * Mark notification as read
 */
async function markAsRead(userId, notificationId) {
  const result = await pool.query(
    `UPDATE notifications 
     SET status = 'read', read_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, status, read_at`,
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Notification not found or access denied');
  }

  return result.rows[0];
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead(userId) {
  const result = await pool.query(
    `UPDATE notifications 
     SET status = 'read', read_at = NOW()
     WHERE user_id = $1 AND status = 'unread'
     RETURNING id`,
    [userId]
  );

  return {
    count: result.rows.length
  };
}

/**
 * Dismiss notification
 */
async function dismissNotification(userId, notificationId) {
  const result = await pool.query(
    `UPDATE notifications 
     SET status = 'dismissed'
     WHERE id = $1 AND user_id = $2
     RETURNING id, status`,
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Notification not found or access denied');
  }

  return result.rows[0];
}

/**
 * Delete notification
 */
async function deleteNotification(userId, notificationId) {
  const result = await pool.query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Notification not found or access denied');
  }

  return result.rows[0];
}

/**
 * Log alert trigger
 */
async function logAlertTrigger(alertId, userId, ticker, triggerValue) {
  try {
    const result = await pool.query(
      `INSERT INTO alert_triggers (alert_id, user_id, ticker, trigger_value, notification_sent)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, alert_id, user_id, ticker, triggered_at`,
      [alertId, userId, ticker, JSON.stringify(triggerValue)]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error logging alert trigger:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  getNotificationCounts,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  deleteNotification,
  logAlertTrigger
};
