require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/environment');
const logger = require('./src/config/logger');
const db = require('./src/config/database');
const alertEngine = require('./src/services/alerts/alert_engine');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
origin: config.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});
app.use('/api/', limiter);

// ============================================
// IMPORT ROUTES
// ============================================

const authRoutes = require('./src/routes/auth');
const screenerRoutes = require('./src/routes/screener');
const alertRoutes = require('./src/routes/alerts');
const marketDataRoutes = require('./src/routes/market_data');

// ============================================
// BASIC ROUTES
// ============================================

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT NOW()');
    res.json({
      status: 'UP',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: 'connected',
      services: {
        alerts: alertEngine.isRunning ? 'running' : 'stopped',
      },
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'DOWN',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Stock Screener API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      screener: '/api/v1/screener',
      alerts: '/api/v1/alerts',
      market: '/api/v1/market',
    },
    documentation: '/api/v1/docs',
  });
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/screener', screenerRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/market', marketDataRoutes);

// Legacy metadata endpoint (backward compatibility)
app.get('/api/v1/metadata/stocks', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        ticker as symbol,
        name, 
        sector, 
        industry, 
        exchange, 
        country 
      FROM companies 
      ORDER BY ticker
    `);
    res.json({
      success: true,
      stocks: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    logger.error('Metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stocks',
      error: error.message,
    });
  }
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.url,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = config.PORT || 8080;

const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`Twelve Data API configured: ${!!config.TWELVE_DATA_API_KEY}`);
  
  // Start alert engine
  alertEngine.start();
  logger.info('Alert engine started');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  // Stop alert engine
  alertEngine.stop();
  
  server.close(() => {
    logger.info('HTTP server closed');
    db.pool.end(() => {
      logger.info('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  
  // Stop alert engine
  alertEngine.stop();
  
  server.close(() => {
    logger.info('HTTP server closed');
    db.pool.end(() => {
      logger.info('Database pool closed');
      process.exit(0);
    });
  });
});

module.exports = app;