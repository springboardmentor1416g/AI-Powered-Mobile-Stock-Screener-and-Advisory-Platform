// src/server.js
require('dotenv').config();
const app = require('./app');
const alertScheduler = require('./scheduler/alert.scheduler');

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`API Gateway running on port ${PORT}`);
  
  // Initialize alert scheduler
  try {
    await alertScheduler.initialize();
    console.log('Alert scheduler initialized');
  } catch (error) {
    console.error('Error initializing alert scheduler:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  alertScheduler.stopAll();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  alertScheduler.stopAll();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

