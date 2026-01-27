/**
 * Alert Engine
 * Monitors stock conditions and triggers user alerts
 */

const db = require('../../config/database');
const logger = require('../../config/logger');
const cron = require('node-cron');

class AlertEngine {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  /**
   * Start the alert engine
   * Runs every 5 minutes to check alert conditions
   */
  start() {
    if (this.isRunning) {
      logger.warn('Alert engine is already running');
      return;
    }

    // Run every 5 minutes: '*/5 * * * *'
    // For testing, you can use '* * * * *' (every minute)
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      await this.checkAlerts();
    });

    this.isRunning = true;
    logger.info('Alert engine started');
  }

  /**
   * Stop the alert engine
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      logger.info('Alert engine stopped');
    }
  }

  /**
   * Check all active alerts
   */
  async checkAlerts() {
    try {
      logger.info('Checking alerts...');

      // Get all active alerts
      const alertsResult = await db.query(`
        SELECT * FROM alert_subscriptions
        WHERE is_active = TRUE
        ORDER BY id
      `);

      const alerts = alertsResult.rows;
      logger.info(`Found ${alerts.length} active alerts to check`);

      for (const alert of alerts) {
        await this.checkAlert(alert);
      }

      logger.info('Alert check completed');
    } catch (error) {
      logger.error('Error checking alerts:', error);
    }
  }

  /**
   * Check a single alert
   * @param {Object} alert - Alert subscription object
   */
  async checkAlert(alert) {
    try {
      const { id, user_id, ticker, alert_type, condition_dsl, last_triggered } = alert;

      // Skip if triggered recently (avoid spam)
      if (last_triggered) {
        const timeSinceLastTrigger = Date.now() - new Date(last_triggered).getTime();
        const minInterval = 60 * 60 * 1000; // 1 hour minimum between triggers

        if (timeSinceLastTrigger < minInterval) {
          return;
        }
      }

      // Evaluate condition based on alert type
      let triggered = false;
      let message = '';

      switch (alert_type) {
        case 'price':
          ({ triggered, message } = await this.checkPriceAlert(ticker, condition_dsl));
          break;

        case 'fundamental':
          ({ triggered, message } = await this.checkFundamentalAlert(ticker, condition_dsl));
          break;

        case 'technical':
          ({ triggered, message } = await this.checkTechnicalAlert(ticker, condition_dsl));
          break;

        case 'earnings':
          ({ triggered, message } = await this.checkEarningsAlert(ticker, condition_dsl));
          break;

        default:
          logger.warn(`Unknown alert type: ${alert_type}`);
          return;
      }

      if (triggered) {
        await this.triggerAlert(id, user_id, ticker, message);
      }
    } catch (error) {
      logger.error(`Error checking alert ${alert.id}:`, error);
    }
  }

  /**
   * Check price-based alert
   */
  async checkPriceAlert(ticker, conditionDsl) {
    try {
      const condition = typeof conditionDsl === 'string' 
        ? JSON.parse(conditionDsl) 
        : conditionDsl;

      // Get current price
      const priceResult = await db.query(`
        SELECT last_price, last_updated
        FROM latest_prices
        WHERE ticker = $1
      `, [ticker]);

      if (priceResult.rows.length === 0) {
        return { triggered: false };
      }

      const currentPrice = parseFloat(priceResult.rows[0].last_price);
      const { operator, value } = condition;

      let triggered = false;
      let message = '';

      switch (operator) {
        case '>':
          triggered = currentPrice > value;
          message = `${ticker} price ($${currentPrice}) crossed above $${value}`;
          break;

        case '<':
          triggered = currentPrice < value;
          message = `${ticker} price ($${currentPrice}) dropped below $${value}`;
          break;

        case '>=':
          triggered = currentPrice >= value;
          message = `${ticker} price ($${currentPrice}) reached or exceeded $${value}`;
          break;

        case '<=':
          triggered = currentPrice <= value;
          message = `${ticker} price ($${currentPrice}) fell to or below $${value}`;
          break;

        default:
          logger.warn(`Unknown operator: ${operator}`);
      }

      return { triggered, message };
    } catch (error) {
      logger.error('Error checking price alert:', error);
      return { triggered: false };
    }
  }

  /**
   * Check fundamental-based alert (e.g., PE ratio, ROE)
   */
  async checkFundamentalAlert(ticker, conditionDsl) {
    try {
      const condition = typeof conditionDsl === 'string' 
        ? JSON.parse(conditionDsl) 
        : conditionDsl;

      // Get latest fundamentals
      const fundResult = await db.query(`
        SELECT *
        FROM latest_fundamentals
        WHERE ticker = $1
      `, [ticker]);

      if (fundResult.rows.length === 0) {
        return { triggered: false };
      }

      const fundamentals = fundResult.rows[0];
      const { field, operator, value } = condition;

      const currentValue = parseFloat(fundamentals[field]);
      if (isNaN(currentValue)) {
        return { triggered: false };
      }

      let triggered = false;
      let message = '';

      switch (operator) {
        case '>':
          triggered = currentValue > value;
          message = `${ticker} ${field} (${currentValue}) exceeded ${value}`;
          break;

        case '<':
          triggered = currentValue < value;
          message = `${ticker} ${field} (${currentValue}) fell below ${value}`;
          break;

        default:
          logger.warn(`Unknown operator: ${operator}`);
      }

      return { triggered, message };
    } catch (error) {
      logger.error('Error checking fundamental alert:', error);
      return { triggered: false };
    }
  }

  /**
   * Check technical indicator alert
   */
  async checkTechnicalAlert(ticker, conditionDsl) {
    try {
      const condition = typeof conditionDsl === 'string' 
        ? JSON.parse(conditionDsl) 
        : conditionDsl;

      // Get latest technical indicators
      const techResult = await db.query(`
        SELECT *
        FROM technical_indicators
        WHERE ticker = $1
        ORDER BY indicator_date DESC
        LIMIT 1
      `, [ticker]);

      if (techResult.rows.length === 0) {
        return { triggered: false };
      }

      const indicators = techResult.rows[0];
      const { field, operator, value } = condition;

      const currentValue = parseFloat(indicators[field]);
      if (isNaN(currentValue)) {
        return { triggered: false };
      }

      let triggered = false;
      let message = '';

      switch (operator) {
        case '>':
          triggered = currentValue > value;
          message = `${ticker} ${field} (${currentValue.toFixed(2)}) crossed above ${value}`;
          break;

        case '<':
          triggered = currentValue < value;
          message = `${ticker} ${field} (${currentValue.toFixed(2)}) dropped below ${value}`;
          break;

        default:
          logger.warn(`Unknown operator: ${operator}`);
      }

      return { triggered, message };
    } catch (error) {
      logger.error('Error checking technical alert:', error);
      return { triggered: false };
    }
  }

  /**
   * Check earnings-related alert
   */
  async checkEarningsAlert(ticker, conditionDsl) {
    try {
      // Check if earnings date is within next 7 days
      const earningsResult = await db.query(`
        SELECT *
        FROM earnings_calendar
        WHERE ticker = $1
        AND earnings_date >= CURRENT_DATE
        AND earnings_date <= CURRENT_DATE + INTERVAL '7 days'
        ORDER BY earnings_date
        LIMIT 1
      `, [ticker]);

      if (earningsResult.rows.length === 0) {
        return { triggered: false };
      }

      const earnings = earningsResult.rows[0];
      const daysUntil = Math.ceil((new Date(earnings.earnings_date) - new Date()) / (1000 * 60 * 60 * 24));

      return {
        triggered: true,
        message: `${ticker} earnings report coming in ${daysUntil} days on ${earnings.earnings_date}`,
      };
    } catch (error) {
      logger.error('Error checking earnings alert:', error);
      return { triggered: false };
    }
  }

  /**
   * Trigger an alert (create notification)
   * @param {Number} alertId - Alert subscription ID
   * @param {String} userId - User ID
   * @param {String} ticker - Stock ticker
   * @param {String} message - Alert message
   */
  async triggerAlert(alertId, userId, ticker, message) {
    try {
      // Insert notification
      await db.query(`
        INSERT INTO alert_notifications (alert_subscription_id, user_id, ticker, message)
        VALUES ($1, $2, $3, $4)
      `, [alertId, userId, ticker, message]);

      // Update last_triggered timestamp
      await db.query(`
        UPDATE alert_subscriptions
        SET last_triggered = NOW()
        WHERE id = $1
      `, [alertId]);

      logger.info('Alert triggered', {
        alertId,
        userId,
        ticker,
        message,
      });

      // In production, send email/push notification here
    } catch (error) {
      logger.error('Error triggering alert:', error);
    }
  }

  /**
   * Create a new alert subscription
   * @param {Object} alertData - Alert configuration
   * @returns {Promise<Object>} - Created alert
   */
  async createAlert(alertData) {
    try {
      const { userId, ticker, alertName, alertType, condition, frequency } = alertData;

      const query = `
        INSERT INTO alert_subscriptions 
        (user_id, ticker, alert_name, alert_type, condition_dsl, frequency)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        userId,
        ticker || null,
        alertName,
        alertType,
        JSON.stringify(condition),
        frequency || 'daily',
      ];

      const result = await db.query(query, values);

      logger.info('Alert created', {
        alertId: result.rows[0].id,
        userId,
        ticker,
      });

      return {
        success: true,
        alert: result.rows[0],
      };
    } catch (error) {
      logger.error('Error creating alert:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's alerts
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - User's alerts
   */
  async getUserAlerts(userId) {
    try {
      const result = await db.query(`
        SELECT * FROM alert_subscriptions
        WHERE user_id = $1
        ORDER BY created_at DESC
      `, [userId]);

      return {
        success: true,
        alerts: result.rows,
      };
    } catch (error) {
      logger.error('Error getting user alerts:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's notifications
   * @param {String} userId - User ID
   * @param {Boolean} unreadOnly - Get only unread notifications
   * @returns {Promise<Object>} - User's notifications
   */
  async getUserNotifications(userId, unreadOnly = false) {
    try {
      let query = `
        SELECT * FROM alert_notifications
        WHERE user_id = $1
      `;

      if (unreadOnly) {
        query += ' AND is_read = FALSE';
      }

      query += ' ORDER BY triggered_at DESC LIMIT 50';

      const result = await db.query(query, [userId]);

      return {
        success: true,
        notifications: result.rows,
      };
    } catch (error) {
      logger.error('Error getting notifications:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Mark notification as read
   * @param {Number} notificationId - Notification ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - Result
   */
  async markAsRead(notificationId, userId) {
    try {
      const result = await db.query(`
        UPDATE alert_notifications
        SET is_read = TRUE, read_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [notificationId, userId]);

      if (result.rows.length === 0) {
        throw new Error('Notification not found');
      }

      return {
        success: true,
        notification: result.rows[0],
      };
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete alert subscription
   * @param {Number} alertId - Alert ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - Result
   */
  async deleteAlert(alertId, userId) {
    try {
      const result = await db.query(`
        DELETE FROM alert_subscriptions
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [alertId, userId]);

      if (result.rows.length === 0) {
        throw new Error('Alert not found');
      }

      logger.info('Alert deleted', { alertId, userId });

      return {
        success: true,
        alert: result.rows[0],
      };
    } catch (error) {
      logger.error('Error deleting alert:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Toggle alert active status
   * @param {Number} alertId - Alert ID
   * @param {String} userId - User ID
   * @param {Boolean} isActive - New active status
   * @returns {Promise<Object>} - Result
   */
  async toggleAlert(alertId, userId, isActive) {
    try {
      const result = await db.query(`
        UPDATE alert_subscriptions
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `, [isActive, alertId, userId]);

      if (result.rows.length === 0) {
        throw new Error('Alert not found');
      }

      return {
        success: true,
        alert: result.rows[0],
      };
    } catch (error) {
      logger.error('Error toggling alert:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new AlertEngine();
