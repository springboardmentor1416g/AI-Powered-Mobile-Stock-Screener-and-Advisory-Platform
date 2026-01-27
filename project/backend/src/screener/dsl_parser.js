/**
 * Screener DSL Parser
 * Parses natural language queries and structured filters into executable queries
 */

const logger = require('../../config/logger');

class DSLParser {
  constructor() {
    // Define available fields and their database mappings
    this.fieldMappings = {
      // Price-related
      price: 'lp.last_price',
      close: 'lp.last_price',
      volume: 'lp.volume',
      market_cap: 'c.market_cap',
      marketcap: 'c.market_cap',

      // Fundamental ratios
      pe: 'lf.pe_ratio',
      pe_ratio: 'lf.pe_ratio',
      pb: 'lf.pb_ratio',
      pb_ratio: 'lf.pb_ratio',
      peg: 'lf.peg_ratio',
      peg_ratio: 'lf.peg_ratio',
      ps: 'lf.ps_ratio',
      ps_ratio: 'lf.ps_ratio',

      // Profitability metrics
      roe: 'lf.roe',
      roa: 'lf.roa',
      operating_margin: 'lf.operating_margin',
      profit_margin: 'lf.profit_margin',
      eps: 'lf.eps',

      // Revenue & Income
      revenue: 'lf.revenue',
      net_income: 'lf.net_income',

      // Company info
      sector: 'c.sector',
      industry: 'c.industry',
      exchange: 'c.exchange',
      country: 'c.country',
      ticker: 'c.ticker',
      name: 'c.name',

      // ✅ Technical indicators (computed)
      rsi: 'ti.rsi_14',
      rsi14: 'ti.rsi_14',
      rsi_14: 'ti.rsi_14',
      sma20: 'ti.sma_20',
      sma_20: 'ti.sma_20',
      sma50: 'ti.sma_50',
      sma_50: 'ti.sma_50',
      sma200: 'ti.sma_200',
      sma_200: 'ti.sma_200',
      ret_1m: 'ti.ret_1m',
      ret_3m: 'ti.ret_3m',
      ret_6m: 'ti.ret_6m',
    };

    // Supported operators (ONLY operators)
    this.operators = {
      '>=': '>=',
      '<=': '<=',
      '>': '>',
      '<': '<',
      '=': '=',
      '!=': '!=',
      equals: '=',
      greater_than: '>',
      less_than: '<',
      between: 'BETWEEN',
      in: 'IN',
      not_in: 'NOT IN',
      like: 'LIKE',
      contains: 'LIKE',
    };
  }

  parseFilter(filter) {
    try {
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      if (!filter || !filter.conditions || filter.conditions.length === 0) {
        return { whereClause: 'TRUE', params: [] };
      }

      for (const condition of filter.conditions) {
        const result = this.parseCondition(condition, paramIndex);
        if (result) {
          conditions.push(result.clause);
          params.push(...result.params);
          paramIndex += result.params.length;
        }
      }

      const logicalOp = filter.logical_operator?.toUpperCase() || 'AND';
      const whereClause =
        conditions.length > 0 ? conditions.join(` ${logicalOp} `) : 'TRUE';

      return { whereClause, params };
    } catch (error) {
      logger.error('Error parsing filter:', error);
      throw new Error(`Failed to parse filter: ${error.message}`);
    }
  }

  parseCondition(condition, startIndex) {
    const { field, operator, value } = condition;

    const dbField = this.fieldMappings[String(field).toLowerCase()];
    if (!dbField) throw new Error(`Unknown field: ${field}`);

    const dbOperator = this.operators[String(operator).toLowerCase()];
    if (!dbOperator) throw new Error(`Unknown operator: ${operator}`);

    switch (dbOperator) {
      case 'BETWEEN':
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error('BETWEEN requires array with 2 values');
        }
        return {
          clause: `${dbField} BETWEEN $${startIndex} AND $${startIndex + 1}`,
          params: value,
        };

      case 'IN':
      case 'NOT IN':
        if (!Array.isArray(value)) {
          throw new Error(`${dbOperator} requires an array of values`);
        }
        return {
          clause: `${dbField} ${dbOperator} (${value
            .map((_, i) => `$${startIndex + i}`)
            .join(', ')})`,
          params: value,
        };

      case 'LIKE':
        return {
          clause: `${dbField} ILIKE $${startIndex}`,
          params: [`%${value}%`],
        };

      default:
        return {
          clause: `${dbField} ${dbOperator} $${startIndex}`,
          params: [value],
        };
    }
  }

  parseNaturalLanguage(query) {
    const conditions = [];
    const lowerQuery = String(query || '').toLowerCase();

    const patterns = [
      // PE ratio patterns
      {
        regex: /pe\s*(?:ratio)?\s*(?:less than|<|below)\s*(\d+\.?\d*)/i,
        handler: (m) => ({
          field: 'pe_ratio',
          operator: '<',
          value: parseFloat(m[1]),
        }),
      },
      {
        regex: /pe\s*(?:ratio)?\s*(?:greater than|>|above)\s*(\d+\.?\d*)/i,
        handler: (m) => ({
          field: 'pe_ratio',
          operator: '>',
          value: parseFloat(m[1]),
        }),
      },

      // ✅ RSI patterns
      {
        regex: /rsi\s*(?:less than|<|below)\s*(\d+\.?\d*)/i,
        handler: (m) => ({
          field: 'rsi',
          operator: '<',
          value: parseFloat(m[1]),
        }),
      },
      {
        regex: /rsi\s*(?:greater than|>|above)\s*(\d+\.?\d*)/i,
        handler: (m) => ({
          field: 'rsi',
          operator: '>',
          value: parseFloat(m[1]),
        }),
      },

      // ROE patterns
      {
        regex: /roe\s*(?:greater than|>|above)\s*(\d+\.?\d*)/i,
        handler: (m) => ({
          field: 'roe',
          operator: '>',
          value: parseFloat(m[1]),
        }),
      },
    ];

    for (const p of patterns) {
      const match = lowerQuery.match(p.regex);
      if (match) conditions.push(p.handler(match));
    }

    if (conditions.length === 0) {
      logger.warn(`No patterns matched for query: ${query}`);
      return { conditions: [], logical_operator: 'AND' };
    }

    return { conditions, logical_operator: 'AND' };
  }

  validateFilter(filter) {
    if (!filter || typeof filter !== 'object') return false;
    if (!Array.isArray(filter.conditions)) return false;

    for (const condition of filter.conditions) {
      if (!condition.field || !condition.operator || condition.value === undefined) {
        return false;
      }
      if (!this.fieldMappings[String(condition.field).toLowerCase()]) return false;
      if (!this.operators[String(condition.operator).toLowerCase()]) return false;
    }
    return true;
  }

  getAvailableFields() {
    return [
      { name: 'price', type: 'number', description: 'Current stock price' },
      { name: 'volume', type: 'number', description: 'Trading volume' },
      { name: 'market_cap', type: 'number', description: 'Market capitalization' },
      { name: 'pe_ratio', type: 'number', description: 'Price to Earnings ratio' },
      { name: 'pb_ratio', type: 'number', description: 'Price to Book ratio' },
      { name: 'peg_ratio', type: 'number', description: 'Price/Earnings to Growth ratio' },
      { name: 'ps_ratio', type: 'number', description: 'Price to Sales ratio' },
      { name: 'roe', type: 'number', description: 'Return on Equity (%)' },
      { name: 'roa', type: 'number', description: 'Return on Assets (%)' },
      { name: 'operating_margin', type: 'number', description: 'Operating Margin (%)' },
      { name: 'profit_margin', type: 'number', description: 'Profit Margin (%)' },
      { name: 'eps', type: 'number', description: 'Earnings Per Share' },
      { name: 'revenue', type: 'number', description: 'Total Revenue' },
      { name: 'net_income', type: 'number', description: 'Net Income' },
      { name: 'sector', type: 'string', description: 'Company sector' },
      { name: 'industry', type: 'string', description: 'Company industry' },
      { name: 'exchange', type: 'string', description: 'Stock exchange' },
      { name: 'country', type: 'string', description: 'Company country' },

      // ✅ technical
      { name: 'rsi', type: 'number', description: 'RSI(14)' },
      { name: 'sma20', type: 'number', description: 'SMA(20)' },
      { name: 'sma50', type: 'number', description: 'SMA(50)' },
      { name: 'sma200', type: 'number', description: 'SMA(200)' },
      { name: 'ret_1m', type: 'number', description: '1-month return %' },
      { name: 'ret_3m', type: 'number', description: '3-month return %' },
      { name: 'ret_6m', type: 'number', description: '6-month return %' },
    ];
  }

  getAvailableOperators() {
    return [
      { operator: '>', description: 'Greater than' },
      { operator: '<', description: 'Less than' },
      { operator: '>=', description: 'Greater than or equal to' },
      { operator: '<=', description: 'Less than or equal to' },
      { operator: '=', description: 'Equal to' },
      { operator: '!=', description: 'Not equal to' },
      { operator: 'between', description: 'Between two values' },
      { operator: 'in', description: 'In a list of values' },
      { operator: 'not_in', description: 'Not in a list of values' },
      { operator: 'like', description: 'Contains (text search)' },
    ];
  }
}

module.exports = new DSLParser();
