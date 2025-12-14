const express = require('express');
const router = express.Router();

router.get('/stocks', (req, res) => {
  res.json([
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', exchange: 'NASDAQ' }
  ]);
});

module.exports = router;
