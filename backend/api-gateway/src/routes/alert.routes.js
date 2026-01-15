const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/auth.middleware');
const alertController = require('../controllers/alert.controller');

// All alert routes require authentication
router.use(authMiddleware);

router.post('/', alertController.createAlert);
router.get('/', alertController.getUserAlerts);
router.get('/:alertId', alertController.getAlert);
router.put('/:alertId', alertController.updateAlert);
router.delete('/:alertId', alertController.deleteAlert);
router.patch('/:alertId/toggle', alertController.toggleAlert);

module.exports = router;
