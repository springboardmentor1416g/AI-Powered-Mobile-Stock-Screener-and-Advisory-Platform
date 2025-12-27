const express = require('express');
const router = express.Router();

/**
 * POST /api/v1/screener/run
 * Temporary test endpoint (mocked results)
 */
router.post('/run', async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Query cannot be empty'
    });
  }

  // MOCK RESULTS
  return res.json({
    success: true,
    results: [
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        pe_ratio: 18.2
      },
      {
        symbol: 'INFY',
        name: 'Infosys Ltd',
        pe_ratio: 21.5
      }
    ]
  });
});

module.exports = router;
