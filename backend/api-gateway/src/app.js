// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const requestLogger = require('./middleware/requestLogger.middleware');
const authRoutes = require('./auth/auth.routes');
const healthRoutes = require('./routes/health.routes');
const metadataRoutes = require('./routes/metadata.routes');
const protectedRoutes = require('./routes/protected.routes');
const screenerRoutes = require('./screener/screener.routes');
const llmRoutes = require('./routes/llm.routes');

const app = express();
const ENV = process.env.ENV || 'dev';

/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger);

/* ---------- Routes ---------- */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', protectedRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/metadata', metadataRoutes);
app.use('/api/v1/screener', screenerRoutes);
app.use('/api/v1/llm', llmRoutes);

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
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error_code: 'SERVER_ERROR',
    trace_id: req.traceId
  });
});

module.exports = app;
