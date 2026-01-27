/**
 * Database Context
 * Manages database connection state and provides database utilities
 */

const db = require('../../config/database');
const logger = require('../../config/logger');

class DatabaseContext {
  constructor() {
    this.isConnected = false;
    this.pool = db.pool;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialize database context
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    try {
      const client = await this.pool.connect();
      client.release();
      
      this.isConnected = true;
      logger.info('Database context initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize database context:', error);
      return false;
    }
  }

  /**
   * Get database connection
   * @returns {Promise<Client>} - Database client
   */
  async getConnection() {
    try {
      const client = await this.pool.connect();
      return client;
    } catch (error) {
      logger.error('Failed to get database connection:', error);
      throw error;
    }
  }

  /**
   * Execute query with retries
   * @param {string} query - SQL query
   * @param {array} params - Query parameters
   * @param {number} retries - Number of retries
   * @returns {Promise<Object>} - Query result
   */
  async executeWithRetry(query, params = [], retries = 3) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await db.query(query, params);
      } catch (error) {
        lastError = error;
        logger.warn(`Query execution failed (attempt ${i + 1}/${retries}):`, error.message);
        
        if (i < retries - 1) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Begin transaction
   * @returns {Promise<Client>} - Transaction client
   */
  async beginTransaction() {
    try {
      const client = await this.getConnection();
      await client.query('BEGIN');
      return client;
    } catch (error) {
      logger.error('Failed to begin transaction:', error);
      throw error;
    }
  }

  /**
   * Commit transaction
   * @param {Client} client - Transaction client
   * @returns {Promise<void>}
   */
  async commitTransaction(client) {
    try {
      await client.query('COMMIT');
      client.release();
    } catch (error) {
      logger.error('Failed to commit transaction:', error);
      throw error;
    }
  }

  /**
   * Rollback transaction
   * @param {Client} client - Transaction client
   * @returns {Promise<void>}
   */
  async rollbackTransaction(client) {
    try {
      await client.query('ROLLBACK');
      client.release();
    } catch (error) {
      logger.error('Failed to rollback transaction:', error);
    }
  }

  /**
   * Close database context
   * @returns {Promise<void>}
   */
  async close() {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info('Database context closed');
    } catch (error) {
      logger.error('Failed to close database context:', error);
    }
  }
}

module.exports = new DatabaseContext();
