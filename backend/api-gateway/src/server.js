const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const db = require('./config/database');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Close database connections
  try {
    await db.pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections', { error: error.message });
  }

  process.exit(0);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(config.port, () => {
  logger.info(`API Gateway started successfully`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Port: ${config.port}`);
  logger.info(`API Version: ${config.apiVersion}`);
  logger.info(`Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server error', { error: error.message });
  process.exit(1);
});

module.exports = server;