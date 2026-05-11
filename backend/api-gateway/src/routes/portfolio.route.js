const router = require('express').Router();
const {
  getPortfolio,
  addHolding,
  updateHolding,
  removeHolding,
  getHolding
} = require('../controllers/portfolio.controller');

router.get('/', getPortfolio);
router.post('/add', addHolding);
router.put('/update', updateHolding);
router.post('/remove', removeHolding);
router.get('/holding', getHolding);

module.exports = router;
