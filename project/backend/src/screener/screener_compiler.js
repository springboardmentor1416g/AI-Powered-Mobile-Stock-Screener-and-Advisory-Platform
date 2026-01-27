/**
 * Screener Compiler
 * Compiles parsed filters into optimized PostgreSQL queries
 */

const logger = require('../../config/logger');
const dslParser = require('./dsl_parser');

class ScreenerCompiler {
  constructor() {
    this.baseQuery = `
      SELECT 
        c.ticker,
        c.name,
        c.sector,
        c.industry,
        c.exchange,
        c.country,
        c.market_cap,
        lp.last_price,
        lp.volume,
        lp.last_updated,
        lf.pe_ratio,
        lf.pb_ratio,
        lf.peg_ratio,
        lf.ps_ratio,
        lf.roe,
        lf.roa,
        lf.operating_margin,
        lf.profit_margin,
        lf.eps,
        lf.revenue,
        lf.net_income,
        ti.rsi_14,
        ti.sma_20,
        ti.sma_50,
        ti.sma_200,
        ti.ret_1m,
        ti.ret_3m,
        ti.ret_6m
      FROM companies c
      LEFT JOIN latest_prices lp ON c.ticker = lp.ticker
      LEFT JOIN latest_fundamentals lf ON c.ticker = lf.ticker
      LEFT JOIN technical_indicators_latest ti ON c.ticker = ti.ticker

    `;
  }

  /**
   * Compile filter into complete SQL query
   * @param {Object} filter - Parsed filter object
   * @param {Object} options - Query options (limit, offset, orderBy)
   * @returns {Object} - { query, params }
   */
  compile(filter, options = {}) {
    try {
      const { whereClause, params } = dslParser.parseFilter(filter);
      
      let query = this.baseQuery;
      
      // Add WHERE clause
      query += `\nWHERE ${whereClause}`;

      // Add ORDER BY
      const orderBy = this.buildOrderBy(options.orderBy);
      if (orderBy) {
        query += `\n${orderBy}`;
      }

      // Add LIMIT
      const limit = parseInt(options.limit) || 100;
      query += `\nLIMIT ${limit}`;

      // Add OFFSET
      const offset = parseInt(options.offset) || 0;
      if (offset > 0) {
        query += `\nOFFSET ${offset}`;
      }

      logger.info('Compiled screener query', {
        conditionCount: filter.conditions?.length || 0,
        limit,
        offset,
      });

      return { query, params };
    } catch (error) {
      logger.error('Error compiling screener query:', error);
      throw new Error(`Query compilation failed: ${error.message}`);
    }
  }

  /**
   * Compile count query (for pagination)
   * @param {Object} filter - Parsed filter object
   * @returns {Object} - { query, params }
   */
  compileCount(filter) {
    try {
      const { whereClause, params } = dslParser.parseFilter(filter);
      
      const query = `
        SELECT COUNT(*) as total
        FROM companies c
        LEFT JOIN latest_prices lp ON c.ticker = lp.ticker
        LEFT JOIN latest_fundamentals lf ON c.ticker = lf.ticker
        WHERE ${whereClause}
      `;

      return { query, params };
    } catch (error) {
      logger.error('Error compiling count query:', error);
      throw new Error(`Count query compilation failed: ${error.message}`);
    }
  }

  /**
   * Build ORDER BY clause
   * @param {Array|String} orderBy - Sort configuration
   * @returns {String} - ORDER BY clause
   */
  buildOrderBy(orderBy) {
    if (!orderBy) {
      return 'ORDER BY c.ticker ASC';
    }

    if (typeof orderBy === 'string') {
      orderBy = [{ field: orderBy, direction: 'ASC' }];
    }

    if (!Array.isArray(orderBy)) {
      return 'ORDER BY c.ticker ASC';
    }

    const orderClauses = orderBy.map(item => {
      const field = dslParser.fieldMappings[item.field?.toLowerCase()];
      const direction = item.direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      if (!field) {
        logger.warn(`Unknown order by field: ${item.field}`);
        return null;
      }

      return `${field} ${direction}`;
    }).filter(Boolean);

    if (orderClauses.length === 0) {
      return 'ORDER BY c.ticker ASC';
    }

    return `ORDER BY ${orderClauses.join(', ')}`;
  }

  /**
   * Compile query with aggregations
   * @param {Object} filter - Parsed filter object
   * @param {Array} aggregations - Aggregation specifications
   * @returns {Object} - { query, params }
   */
  compileWithAggregations(filter, aggregations) {
    try {
      const { whereClause, params } = dslParser.parseFilter(filter);
      
      const selectClauses = aggregations.map(agg => {
        const field = dslParser.fieldMappings[agg.field?.toLowerCase()];
        if (!field) {
          throw new Error(`Unknown aggregation field: ${agg.field}`);
        }

        const func = agg.function?.toUpperCase() || 'AVG';
        const alias = agg.alias || `${func.toLowerCase()}_${agg.field}`;

        return `${func}(${field}) as ${alias}`;
      });

      const query = `
        SELECT ${selectClauses.join(', ')}
        FROM companies c
        LEFT JOIN latest_prices lp ON c.ticker = lp.ticker
        LEFT JOIN latest_fundamentals lf ON c.ticker = lf.ticker
        WHERE ${whereClause}
      `;

      return { query, params };
    } catch (error) {
      logger.error('Error compiling aggregation query:', error);
      throw new Error(`Aggregation query compilation failed: ${error.message}`);
    }
  }

  /**
   * Compile sector/industry breakdown query
   * @param {Object} filter - Parsed filter object
   * @param {String} groupBy - 'sector' or 'industry'
   * @returns {Object} - { query, params }
   */
  compileBreakdown(filter, groupBy = 'sector') {
    try {
      const { whereClause, params } = dslParser.parseFilter(filter);
      
      const groupField = groupBy === 'industry' ? 'c.industry' : 'c.sector';

      const query = `
        SELECT 
          ${groupField} as category,
          COUNT(*) as count,
          AVG(lf.pe_ratio) as avg_pe,
          AVG(lf.roe) as avg_roe,
          AVG(lp.last_price) as avg_price
        FROM companies c
        LEFT JOIN latest_prices lp ON c.ticker = lp.ticker
        LEFT JOIN latest_fundamentals lf ON c.ticker = lf.ticker
        WHERE ${whereClause}
        GROUP BY ${groupField}
        ORDER BY count DESC
        LIMIT 20
      `;

      return { query, params };
    } catch (error) {
      logger.error('Error compiling breakdown query:', error);
      throw new Error(`Breakdown query compilation failed: ${error.message}`);
    }
  }

  /**
   * Compile comparison query for specific tickers
   * @param {Array} tickers - List of ticker symbols
   * @returns {Object} - { query, params }
   */
  compileComparison(tickers) {
    try {
      if (!Array.isArray(tickers) || tickers.length === 0) {
        throw new Error('Tickers array is required');
      }

      const placeholders = tickers.map((_, i) => `$${i + 1}`).join(', ');

      const query = `
        ${this.baseQuery}
        WHERE c.ticker IN (${placeholders})
        ORDER BY c.ticker
      `;

      return { query, params: tickers };
    } catch (error) {
      logger.error('Error compiling comparison query:', error);
      throw new Error(`Comparison query compilation failed: ${error.message}`);
    }
  }

  /**
   * Validate compiled query (safety check)
   * @param {String} query - SQL query to validate
   * @returns {Boolean}
   */
  validateQuery(query) {
    // Check for dangerous SQL keywords
    const dangerousKeywords = [
      'DROP', 'DELETE', 'TRUNCATE', 'INSERT', 'UPDATE',
      'CREATE', 'ALTER', 'GRANT', 'REVOKE',
    ];

    const upperQuery = query.toUpperCase();
    
    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword)) {
        logger.error(`Dangerous SQL keyword detected: ${keyword}`);
        return false;
      }
    }

    // Ensure query is a SELECT
    if (!upperQuery.trim().startsWith('SELECT')) {
      logger.error('Query must be a SELECT statement');
      return false;
    }

    return true;
  }

  /**
   * Get query execution plan (for optimization)
   * @param {String} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Object} - { query: 'EXPLAIN ...', params }
   */
  getExecutionPlan(query, params) {
    return {
      query: `EXPLAIN ANALYZE ${query}`,
      params,
    };
  }
}

module.exports = new ScreenerCompiler();