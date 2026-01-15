const alertService = require('../services/alert.service');

/**
 * Create alert subscription
 * POST /api/v1/alerts
 */
exports.createAlert = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { ticker, alertRule, name, alertType, evaluationFrequency, status } = req.body;

    if (!ticker || !alertRule) {
      return res.status(400).json({
        success: false,
        message: 'Ticker and alertRule are required',
        error_code: 'BAD_REQUEST'
      });
    }

    const alert = await alertService.createAlert(userId, ticker, alertRule, {
      name,
      alertType,
      evaluationFrequency,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Alert subscription created',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user alerts
 * GET /api/v1/alerts
 */
exports.getUserAlerts = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, alertType, ticker } = req.query;

    const alerts = await alertService.getUserAlerts(userId, {
      status,
      alertType,
      ticker
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
 * Get alert by ID
 * GET /api/v1/alerts/:alertId
 */
exports.getAlert = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { alertId } = req.params;

    const alert = await alertService.getAlert(userId, parseInt(alertId));

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
        error_code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update alert
 * PUT /api/v1/alerts/:alertId
 */
exports.updateAlert = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { alertId } = req.params;
    const { alertRule, name, status, evaluationFrequency } = req.body;

    const updates = {};
    if (alertRule !== undefined) updates.alertRule = alertRule;
    if (name !== undefined) updates.name = name;
    if (status !== undefined) updates.status = status;
    if (evaluationFrequency !== undefined) updates.evaluationFrequency = evaluationFrequency;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        error_code: 'BAD_REQUEST'
      });
    }

    const alert = await alertService.updateAlert(userId, parseInt(alertId), updates);

    res.json({
      success: true,
      message: 'Alert updated',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete alert
 * DELETE /api/v1/alerts/:alertId
 */
exports.deleteAlert = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { alertId } = req.params;

    const result = await alertService.deleteAlert(userId, parseInt(alertId));

    res.json({
      success: true,
      message: 'Alert deleted',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle alert (enable/disable)
 * PATCH /api/v1/alerts/:alertId/toggle
 */
exports.toggleAlert = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { alertId } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'active must be a boolean',
        error_code: 'BAD_REQUEST'
      });
    }

    const alert = await alertService.toggleAlert(userId, parseInt(alertId), active);

    res.json({
      success: true,
      message: `Alert ${active ? 'enabled' : 'disabled'}`,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};
