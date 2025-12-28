/**
 * Screener Compiler Service
 * 
 * Responsibilities:
 * - Translate validated DSL to SQL queries
 * - Map DSL fields to database schema
 * - Generate proper JOINs between tables
 * - Handle logical operators (AND, OR, NOT)
 * - Apply sorting and limits
 * 
 * Security:
 * - Only accepts validated DSL (never raw user input)
 * - Uses parameterized queries to prevent SQL injection
 */

const FIELD_TABLE_MAP = {
  // From companies table
  'ticker': { table: 'companies', column: 'ticker' },
  'name': { table: 'companies', column: 'name' },
  'market_cap': { table: 'companies', column: 'market_cap' },
  'sector': { table: 'companies', column: 'sector' },
  'industry': { table: 'companies', column: 'industry' },
  'exchange': { table: 'companies', column: 'exchange' },
  
  // From price_history table
  'open': { table: 'price_history', column: 'open' },
  'high': { table: 'price_history', column: 'high' },
  'low': { table: 'price_history', column: 'low' },
  'close': { table: 'price_history', column: 'close' },
  'volume': { table: 'price_history', column: 'volume' },
  
  // From fundamentals_quarterly table
  'revenue': { table: 'fundamentals_quarterly', column: 'revenue' },
  'net_income': { table: 'fundamentals_quarterly', column: 'net_income' },
  'eps': { table: 'fundamentals_quarterly', column: 'eps' },
  'operating_margin': { table: 'fundamentals_quarterly', column: 'operating_margin' },
  'roe': { table: 'fundamentals_quarterly', column: 'roe' },
  'roa': { table: 'fundamentals_quarterly', column: 'roa' },
  'pe_ratio': { table: 'fundamentals_quarterly', column: 'pe_ratio' },
  'pb_ratio': { table: 'fundamentals_quarterly', column: 'pb_ratio' },
  
  // From debt_profile table
  'short_term_debt': { table: 'debt_profile', column: 'short_term_debt' },
  'long_term_debt': { table: 'debt_profile', column: 'long_term_debt' },
  'debt_to_equity': { table: 'debt_profile', column: 'debt_to_equity' },
  
  // From cashflow_statements table
  'cfo': { table: 'cashflow_statements', column: 'cfo' },
  'cfi': { table: 'cashflow_statements', column: 'cfi' },
  'cff': { table: 'cashflow_statements', column: 'cff' },
  'capex': { table: 'cashflow_statements', column: 'capex' },
  
  // From analyst_estimates table
  'eps_estimate': { table: 'analyst_estimates', column: 'eps_estimate' },
  'revenue_estimate': { table: 'analyst_estimates', column: 'revenue_estimate' },
  'price_target_low': { table: 'analyst_estimates', column: 'price_target_low' },
  'price_target_avg': { table: 'analyst_estimates', column: 'price_target_avg' },
  'price_target_high': { table: 'analyst_estimates', column: 'price_target_high' }
};

class ScreenerCompilerService {
  /**
   * Compile DSL to SQL query
   * @param {object} dsl - Validated DSL object
   * @returns {object} { sql: string, params: array, requiredTables: Set }
   */
  compile(dsl) {
    const context = {
      params: [],
      paramCounter: 1,
      requiredTables: new Set(['companies'])
    };

    const whereClause = this._compileFilter(dsl.filter, context);
    const joins = this._generateJoins(context.requiredTables);
    const orderBy = dsl.sort ? this._compileSort(dsl.sort) : 'c.market_cap DESC';
    const limit = dsl.limit || 100;

    const sql = `
      SELECT DISTINCT
        c.ticker,
        c.name,
        c.sector,
        c.market_cap,
        c.exchange,
        fq.pe_ratio,
        fq.roe,
        fq.revenue,
        fq.net_income
      FROM companies c
      ${joins}
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${context.paramCounter}
    `.trim();

    context.params.push(limit);

    return {
      sql,
      params: context.params,
      requiredTables: Array.from(context.requiredTables)
    };
  }

  /**
   * Compile filter expression to SQL WHERE clause
   * @private
   */
  _compileFilter(filter, context) {
    if (!filter) {
      return '1=1';
    }

    if (filter.and) {
      return this._compileAnd(filter.and, context);
    } else if (filter.or) {
      return this._compileOr(filter.or, context);
    } else if (filter.not) {
      return this._compileNot(filter.not, context);
    }

    return '1=1';
  }

  /**
   * Compile AND conditions
   * @private
   */
  _compileAnd(conditions, context) {
    const compiled = conditions.map(cond => {
      if (this._isCondition(cond)) {
        return this._compileCondition(cond, context);
      } else {
        return `(${this._compileFilter(cond, context)})`;
      }
    });

    return compiled.join(' AND ');
  }

  /**
   * Compile OR conditions
   * @private
   */
  _compileOr(conditions, context) {
    const compiled = conditions.map(cond => {
      if (this._isCondition(cond)) {
        return this._compileCondition(cond, context);
      } else {
        return `(${this._compileFilter(cond, context)})`;
      }
    });

    return `(${compiled.join(' OR ')})`;
  }

  /**
   * Compile NOT condition
   * @private
   */
  _compileNot(condition, context) {
    if (this._isCondition(condition)) {
      return `NOT (${this._compileCondition(condition, context)})`;
    } else {
      return `NOT (${this._compileFilter(condition, context)})`;
    }
  }

  /**
   * Check if object is a condition
   * @private
   */
  _isCondition(obj) {
    return obj && obj.field && obj.operator;
  }

  /**
   * Compile single condition to SQL
   * @private
   */
  _compileCondition(condition, context) {
    const fieldInfo = FIELD_TABLE_MAP[condition.field];
    if (!fieldInfo) {
      throw new Error(`Unknown field: ${condition.field}`);
    }

    context.requiredTables.add(fieldInfo.table);

    const tableAlias = this._getTableAlias(fieldInfo.table);
    const columnRef = `${tableAlias}.${fieldInfo.column}`;

    switch (condition.operator) {
      case '<':
      case '>':
      case '<=':
      case '>=':
      case '=':
      case '!=':
        context.params.push(condition.value);
        return `${columnRef} ${condition.operator} $${context.paramCounter++}`;

      case 'between':
        context.params.push(condition.value[0], condition.value[1]);
        return `${columnRef} BETWEEN $${context.paramCounter++} AND $${context.paramCounter++}`;

      case 'in':
        const placeholders = condition.value.map(() => `$${context.paramCounter++}`).join(', ');
        context.params.push(...condition.value);
        return `${columnRef} IN (${placeholders})`;

      case 'exists':
        return condition.value ? `${columnRef} IS NOT NULL` : `${columnRef} IS NULL`;

      default:
        throw new Error(`Unsupported operator: ${condition.operator}`);
    }
  }

  /**
   * Generate JOIN clauses based on required tables
   * @private
   */
  _generateJoins(requiredTables) {
    const joins = [];

    if (requiredTables.has('fundamentals_quarterly')) {
      joins.push(`
        LEFT JOIN LATERAL (
          SELECT * FROM fundamentals_quarterly
          WHERE ticker = c.ticker
          ORDER BY id DESC
          LIMIT 1
        ) fq ON true
      `.trim());
    }

    if (requiredTables.has('price_history')) {
      joins.push(`
        LEFT JOIN LATERAL (
          SELECT * FROM price_history
          WHERE ticker = c.ticker
          ORDER BY time DESC
          LIMIT 1
        ) ph ON true
      `.trim());
    }

    if (requiredTables.has('debt_profile')) {
      joins.push(`
        LEFT JOIN LATERAL (
          SELECT * FROM debt_profile
          WHERE ticker = c.ticker
          ORDER BY id DESC
          LIMIT 1
        ) dp ON true
      `.trim());
    }

    if (requiredTables.has('cashflow_statements')) {
      joins.push(`
        LEFT JOIN LATERAL (
          SELECT * FROM cashflow_statements
          WHERE ticker = c.ticker
          ORDER BY id DESC
          LIMIT 1
        ) cs ON true
      `.trim());
    }

    if (requiredTables.has('analyst_estimates')) {
      joins.push(`
        LEFT JOIN LATERAL (
          SELECT * FROM analyst_estimates
          WHERE ticker = c.ticker
          ORDER BY estimate_date DESC
          LIMIT 1
        ) ae ON true
      `.trim());
    }

    return joins.join('\n      ');
  }

  /**
   * Get table alias
   * @private
   */
  _getTableAlias(tableName) {
    const aliasMap = {
      'companies': 'c',
      'fundamentals_quarterly': 'fq',
      'price_history': 'ph',
      'debt_profile': 'dp',
      'cashflow_statements': 'cs',
      'analyst_estimates': 'ae'
    };
    return aliasMap[tableName] || tableName;
  }

  /**
   * Compile sort clause
   * @private
   */
  _compileSort(sort) {
    if (Array.isArray(sort)) {
      return sort.map(s => {
        const fieldInfo = FIELD_TABLE_MAP[s.field];
        const tableAlias = this._getTableAlias(fieldInfo.table);
        const direction = s.direction || 'ASC';
        return `${tableAlias}.${fieldInfo.column} ${direction}`;
      }).join(', ');
    } else {
      const fieldInfo = FIELD_TABLE_MAP[sort.field];
      const tableAlias = this._getTableAlias(fieldInfo.table);
      const direction = sort.direction || 'ASC';
      return `${tableAlias}.${fieldInfo.column} ${direction}`;
    }
  }
}

module.exports = new ScreenerCompilerService();
