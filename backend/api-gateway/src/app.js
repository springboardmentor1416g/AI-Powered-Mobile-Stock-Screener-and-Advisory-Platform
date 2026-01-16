// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const requestLogger = require('./middleware/requestLogger.middleware');
const authRoutes = require('./auth/auth.routes');
const healthRoutes = require('./routes/health.routes');
const metadataRoutes = require('./routes/metadata.routes');
const protectedRoutes = require('./routes/protected.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const alertRoutes = require('./routes/alert.routes');
const notificationRoutes = require('./routes/notification.routes');

// Load optional/external modules with fallback
let screenerRoutes, llmRoutes, llmParserRoutes;
try {
  screenerRoutes = require('./screener/screener.routes');
} catch (e) {
  // Screener routes not available in test environment
  screenerRoutes = require('express').Router();
}

try {
  llmRoutes = require('./routes/llm.routes');
} catch (e) {
  // LLM routes not available
  llmRoutes = require('express').Router();
}

try {
  llmParserRoutes = require('./services/llm_parser/llm_parser.routes');
} catch (e) {
  // LLM parser routes not available
  llmParserRoutes = require('express').Router();
}

const app = express();
const ENV = process.env.ENV || 'dev';

/* ---------- Middleware ---------- */
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger);

/* ---------- Routes ---------- */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', protectedRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/metadata', metadataRoutes);
app.use('/api/v1/screener', screenerRoutes);
app.use('/api/v1/llm', llmParserRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/watchlists', watchlistRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/notifications', notificationRoutes);

/* ---------- 404 Handler ---------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error_code: 'NOT_FOUND'
  });
});

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  console.error('Error stack:', err.stack);
  console.error('Error message:', err.message);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error_code: err.code || 'SERVER_ERROR',
    trace_id: req.traceId,
    ...(ENV === 'dev' && { stack: err.stack })
  });
});

module.exports = app;
