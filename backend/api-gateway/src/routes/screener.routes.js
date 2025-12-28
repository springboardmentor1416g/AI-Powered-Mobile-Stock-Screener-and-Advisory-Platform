import { Router } from 'express';

const router = Router();

router.post('/run', (req, res) => {
  const { query } = req.body;

  res.json({
    success: true,
    query,
    results: [
      { symbol: 'AAPL', revenue_growth: 12.4, debt_to_equity: 0.32 },
      { symbol: 'MSFT', revenue_growth: 15.1, debt_to_equity: 0.28 }
    ]
  });
});

export default router;
