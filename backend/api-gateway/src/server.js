const app = require('./app');
const config = require('./config');
// const logger = require('./config/logger');
// const db = require('./config/database');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception', error.message, error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection', reason, promise);
  process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);
  
  // Close database connections
  // try {
  //   await db.pool.end();
  //   logger.info('Database connections closed');
  // } catch (error) {
  //   logger.error('Error closing database connections', { error: error.message });
  // }

  process.exit(0);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(config.port, () => {
  console.log(`API Gateway started successfully on port ${config.port}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error', error.message);
  process.exit(1);
});

module.exports = server;