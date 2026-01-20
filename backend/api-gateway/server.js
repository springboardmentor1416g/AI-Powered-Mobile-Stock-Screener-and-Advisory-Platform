const express = require('express');
const cors = require('cors');
const app = express();
const screenerRoutes = require('./src/routes/screener');
const healthRoutes = require('./src/routes/healthRoutes');
const metadataRoutes = require('./src/routes/metadataRoutes');

app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Stock Screener API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      iscreener: '/api/screener',
      metadata: '/api/metadata'
    }
  });
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/screener', screenerRoutes);
app.use('/api/metadata', metadataRoutes);

app.listen(3000, () => {
  console.log('Backend server running on http://localhost:3000');
});