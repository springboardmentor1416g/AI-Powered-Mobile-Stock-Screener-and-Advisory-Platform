const express = require('express');
const { alerts, notifications } = require('./alerts.store');
const router = express.Router();

router.post('/', (req, res) => {
  const alert = {
    id: Date.now(),
    symbol: req.body.symbol,
    type: req.body.type,      // price | pe
    operator: req.body.operator,
    value: req.body.value,
    lastTriggered: null
  };

  alerts.push(alert);
  res.json({ status: 'success', alert });
});

router.get('/', (req, res) => {
  res.json({ alerts });
});

router.get('/notifications', (req, res) => {
  res.json({ notifications });
});

module.exports = router;
