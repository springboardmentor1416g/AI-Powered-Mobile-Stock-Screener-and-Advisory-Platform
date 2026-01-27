/**
 * Screener Runner
 * Executes compiled screening queries and returns results
 */

const db = require('../../config/database');
const logger = require('../../config/logger');
const dslParser = require('./dsl_parser');
const screenerCompiler = require('./screener_compiler');

class ScreenerRunner {
  /**
   * Run a screening query
   * @param {Object} filter - Filter object or natural language query
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} - Screening results
   */
  async run(filter, options = {}) {
    try {
      const startTime = Date.now();

      // Parse natural language if string is provided
      if (typeof filter === 'string') {
        logger.info('Parsing natural language query:', filter);
        filter = dslParser.parseNaturalLanguage(filter);
      }

      // Validate filter
      if (!dslParser.validateFilter(filter)) {
        throw new Error('Invalid filter format');
      }

      // Compile queries
      const { query, params } = screenerCompiler.compile(filter, options);
      const { query: countQuery, params: countParams } = screenerCompiler.compileCount(filter);

      // Validate compiled queries
      if (!screenerCompiler.validateQuery(query)) {
        throw new Error('Query validation failed');
      }

      // Execute count query (for pagination)
      const countResult = await db.query(countQuery, countParams);
      const totalResults = parseInt(countResult.rows[0].total);

      // Execute main query
      const result = await db.query(query, params);
      
      const executionTime = Date.now() - startTime;

      logger.info('Screener query executed', {
        resultsCount: result.rows.length,
        totalResults,
        executionTime: `${executionTime}ms`,
      });

      return {
        success: true,
        data: result.rows,
        meta: {
          total: totalResults,
          count: result.rows.length,
          limit: options.limit || 100,
          offset: options.offset || 0,
          executionTime,
          filter,
        },
      };
    } catch (error) {
      logger.error('Error running screener:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Run aggregation query
   * @param {Object} filter - Filter object
   * @param {Array} aggregations - Aggregation specifications
   * @returns {Promise<Object>} - Aggregation results
   */
  async runAggregations(filter, aggregations) {
    try {
      if (typeof filter === 'string') {
        filter = dslParser.parseNaturalLanguage(filter);
      }

      const { query, params } = screenerCompiler.compileWithAggregations(filter, aggregations);
      
      const result = await db.query(query, params);

      logger.info('Aggregation query executed', {
        aggregationCount: aggregations.length,
      });

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      logger.error('Error running aggregations:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get sector/industry breakdown
   * @param {Object} filter - Filter object
   * @param {String} groupBy - 'sector' or 'industry'
   * @returns {Promise<Object>} - Breakdown results
   */
  async getBreakdown(filter, groupBy = 'sector') {
    try {
      if (typeof filter === 'string') {
        filter = dslParser.parseNaturalLanguage(filter);
      }

      const { query, params } = screenerCompiler.compileBreakdown(filter, groupBy);
      
      const result = await db.query(query, params);

      logger.info('Breakdown query executed', {
        groupBy,
        categoriesCount: result.rows.length,
      });

      return {
        success: true,
        data: result.rows,
        groupBy,
      };
    } catch (error) {
      logger.error('Error getting breakdown:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Compare specific stocks
   * @param {Array} tickers - List of ticker symbols
   * @returns {Promise<Object>} - Comparison results
   */
  async compare(tickers) {
    try {
      if (!Array.isArray(tickers) || tickers.length === 0) {
        throw new Error('Tickers array is required');
      }

      const { query, params } = screenerCompiler.compileComparison(tickers);
      
      const result = await db.query(query, params);

      logger.info('Comparison query executed', {
        tickersCount: tickers.length,
        resultsCount: result.rows.length,
      });

      return {
        success: true,
        data: result.rows,
        tickers,
      };
    } catch (error) {
      logger.error('Error comparing stocks:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Run saved screen
   * @param {Number} screenId - Saved screen ID
   * @param {String} userId - User ID (optional, for authorization)
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} - Screen results
   */
  async runSavedScreen(screenId, userId = null, options = {}) {
    try {
      // Fetch saved screen
      let query = 'SELECT * FROM saved_screens WHERE id = $1';
      const params = [screenId];

      if (userId) {
        query += ' AND (user_id = $2 OR is_public = TRUE)';
        params.push(userId);
      }

      const screenResult = await db.query(query, params);

      if (screenResult.rows.length === 0) {
        throw new Error('Saved screen not found or not accessible');
      }

      const savedScreen = screenResult.rows[0];
      const filter = savedScreen.dsl_query;

      logger.info('Running saved screen', {
        screenId,
        screenName: savedScreen.screen_name,
      });

      // Run the screen
      return await this.run(filter, options);
    } catch (error) {
      logger.error('Error running saved screen:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Save a screen for future use
   * @param {String} userId - User ID
   * @param {String} name - Screen name
   * @param {Object} filter - Filter object
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Saved screen info
   */
  async saveScreen(userId, name, filter, options = {}) {
    try {
      const query = `
        INSERT INTO saved_screens (user_id, screen_name, description, dsl_query, is_public)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const params = [
        userId,
        name,
        options.description || null,
        JSON.stringify(filter),
        options.isPublic || false,
      ];

      const result = await db.query(query, params);

      logger.info('Screen saved', {
        screenId: result.rows[0].id,
        screenName: name,
        userId,
      });

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      logger.error('Error saving screen:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's saved screens
   * @param {String} userId - User ID
   * @param {Boolean} includePublic - Include public screens
   * @returns {Promise<Object>} - List of saved screens
   */
  async getUserScreens(userId, includePublic = true) {
    try {
      let query = `
        SELECT id, screen_name, description, is_public, created_at, updated_at
        FROM saved_screens
        WHERE user_id = $1
      `;

      if (includePublic) {
        query += ' OR is_public = TRUE';
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, [userId]);

      return {
        success: true,
        data: result.rows,
      };
    } catch (error) {
      logger.error('Error fetching user screens:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a saved screen
   * @param {Number} screenId - Screen ID
   * @param {String} userId - User ID (for authorization)
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteScreen(screenId, userId) {
    try {
      const query = `
        DELETE FROM saved_screens
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;

      const result = await db.query(query, [screenId, userId]);

      if (result.rows.length === 0) {
        throw new Error('Screen not found or not authorized to delete');
      }

      logger.info('Screen deleted', {
        screenId,
        userId,
      });

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      logger.error('Error deleting screen:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get query execution statistics
   * @param {Object} filter - Filter object
   * @returns {Promise<Object>} - Execution plan
   */
  async getExecutionPlan(filter) {
    try {
      if (typeof filter === 'string') {
        filter = dslParser.parseNaturalLanguage(filter);
      }

      const { query, params } = screenerCompiler.compile(filter);
      const { query: explainQuery, params: explainParams } = 
        screenerCompiler.getExecutionPlan(query, params);

      const result = await db.query(explainQuery, explainParams);

      return {
        success: true,
        plan: result.rows,
      };
    } catch (error) {
      logger.error('Error getting execution plan:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get available fields and operators
   * @returns {Object} - Metadata for building queries
   */
  getMetadata() {
    return {
      fields: dslParser.getAvailableFields(),
      operators: dslParser.getAvailableOperators(),
    };
  }
}

module.exports = new ScreenerRunner();