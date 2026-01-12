import express from 'express';

const app = express();

app.use(express.json()); // ✅ REQUIRED

app.post('/api/llm/translate', (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  return res.json({
    success: true,
    dsl: {
      filters: [
        {
          metric: 'revenue_growth',
          operator: '>',
          value: 10,
          period: 'annual'
        }
      ],
      logic: 'AND'
    }
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('API Gateway running on port 3000');
});