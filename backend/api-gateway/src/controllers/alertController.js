/**
 * Alert Controller
 * HTTP request handlers for alert subscription management
 */

const alertService = require('../services/alertService');
const logger = require('../config/logger');

/**
 * Get all alerts for the authenticated user
 */
const getAlerts = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }
    const { status, type, ticker, limit, offset } = req.query;
    
    const alerts = await alertService.getUserAlerts(userId, {
      status,
      type,
      ticker,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific alert by ID
 */
const getAlertById = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    const { alertId } = req.params;
    
    const alert = await alertService.getAlertById(alertId, userId);
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new alert
 */
const createAlert = async (req, res, next) => {
  try {
    const userId = req.body?.user_id || req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }
    const alert = await alertService.createAlert(userId, req.body);
    
    logger.info('Alert created', { alertId: alert.alert_id, userId, type: alert.alert_type });
    
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an alert
 */
const updateAlert = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    const { alertId } = req.params;
    
    const alert = await alertService.updateAlert(alertId, userId, req.body);
    
    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable an alert
 */
const enableAlert = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    const { alertId } = req.params;
    
    const alert = await alertService.setAlertStatus(alertId, userId, 'active');
    
    logger.info('Alert enabled', { alertId, userId });
    
    res.json({
      success: true,
      message: 'Alert enabled',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable (pause) an alert
 */
const disableAlert = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    const { alertId } = req.params;
    
    const alert = await alertService.setAlertStatus(alertId, userId, 'paused');
    
    logger.info('Alert disabled', { alertId, userId });
    
    res.json({
      success: true,
      message: 'Alert paused',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an alert
 */
const deleteAlert = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    const { alertId } = req.params;
    
    const result = await alertService.deleteAlert(alertId, userId);
    
    logger.info('Alert deleted', { alertId, userId });
    
    res.json({
      success: true,
      message: 'Alert deleted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get alert history
 */
const getAlertHistory = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    const { alertId } = req.params;
    const { limit } = req.query;
    
    const history = await alertService.getAlertHistory(
      alertId, 
      userId, 
      limit ? parseInt(limit) : undefined
    );
    
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Acknowledge an alert trigger
 */
const acknowledgeAlert = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    const { alertId, historyId } = req.params;
    
    const result = await alertService.acknowledgeAlert(historyId, alertId, userId);
    
    res.json({
      success: true,
      message: 'Alert acknowledged',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's alert summary
 */
const getAlertSummary = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user?.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }
    const summary = await alertService.getAlertSummary(userId);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  enableAlert,
  disableAlert,
  deleteAlert,
  getAlertHistory,
  acknowledgeAlert,
  getAlertSummary
};
