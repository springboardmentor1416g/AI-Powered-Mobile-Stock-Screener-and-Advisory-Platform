const express = require('express');
const { portfolio } = require('./portfolio.store');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'success', data: portfolio });
});

router.post('/', (req, res) => {
  const { symbol, quantity, buyPrice } = req.body;

  portfolio.push({
    id: Date.now(),
    symbol,
    quantity,
    buyPrice
  });

  res.json({ status: 'success', message: 'Added to portfolio' });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = portfolio.findIndex(p => p.id === id);
  if (index !== -1) portfolio.splice(index, 1);
  res.json({ status: 'success' });
});

module.exports = router;
