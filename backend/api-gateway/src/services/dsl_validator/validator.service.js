/**
 * DSL Validator Service
 * 
 * Responsibilities:
 * - Validate DSL structure and syntax
 * - Ensure DSL contains only allowed fields and operators
 * - Prevent SQL injection by validating field names
 * - Reject malformed or unsafe DSL before compilation
 * 
 * Security:
 * - Only validated DSL passes to the compiler
 * - LLM output is never directly used in SQL
 */

const ALLOWED_FIELDS = [
  // From companies table
  'ticker', 'name', 'market_cap', 'sector', 'industry', 'exchange',
  'next_earnings_date', 'last_buyback_date',
  
  // From price_history table
  'open', 'high', 'low', 'close', 'volume',
  
  // From fundamentals_quarterly table
  'revenue', 'net_income', 'eps', 'operating_margin', 'roe', 'roa', 
  'pe_ratio', 'pb_ratio', 'promoter_holding', 'peg_ratio', 'ebitda',
  'revenue_growth_yoy', 'ebitda_growth_yoy',
  
  // From debt_profile table
  'short_term_debt', 'long_term_debt', 'debt_to_equity', 'total_debt',
  
  // From cashflow_statements table
  'cfo', 'cfi', 'cff', 'capex', 'free_cash_flow',
  
  // From analyst_estimates table
  'eps_estimate', 'revenue_estimate', 'price_target_low', 
  'price_target_avg', 'price_target_high'
];

const ALLOWED_OPERATORS = ['<', '>', '<=', '>=', '=', '!=', 'between', 'in', 'exists', 'all_quarters'];

const ALLOWED_LOGICAL_OPERATORS = ['and', 'or', 'not'];

class DSLValidatorService {
  /**
   * Validate DSL structure and content
   * @param {object} dsl - DSL object from LLM parser
   * @returns {object} { valid: boolean, errors: array, sanitizedDSL: object }
   */
  validate(dsl) {
    const errors = [];

    // Check if DSL is an object
    if (!dsl || typeof dsl !== 'object') {
      return {
        valid: false,
        errors: ['DSL must be an object'],
        sanitizedDSL: null
      };
    }

    // Validate filter structure
    if (!dsl.filter) {
      return {
        valid: false,
        errors: ['DSL must contain a filter property'],
        sanitizedDSL: null
      };
    }

    // Validate filter contents
    const filterErrors = this._validateFilter(dsl.filter);
    errors.push(...filterErrors);

    // Validate sort if present
    if (dsl.sort) {
      const sortErrors = this._validateSort(dsl.sort);
      errors.push(...sortErrors);
    }

    // Validate limit if present
    if (dsl.limit !== undefined) {
      const limitErrors = this._validateLimit(dsl.limit);
      errors.push(...limitErrors);
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedDSL: errors.length === 0 ? dsl : null
    };
  }

  /**
   * Validate filter structure recursively
   * @private
   */
  _validateFilter(filter) {
    const errors = [];

    if (!filter || typeof filter !== 'object') {
      errors.push('Filter must be an object');
      return errors;
    }

    // Check for logical operators
    for (const key of Object.keys(filter)) {
      if (ALLOWED_LOGICAL_OPERATORS.includes(key)) {
        // Validate logical operator contents
        if (!Array.isArray(filter[key])) {
          errors.push(`Logical operator '${key}' must contain an array`);
          continue;
        }

        // Recursively validate each condition
        for (const condition of filter[key]) {
          if (this._isCondition(condition)) {
            const condErrors = this._validateCondition(condition);
            errors.push(...condErrors);
          } else if (typeof condition === 'object') {
            const nestedErrors = this._validateFilter(condition);
            errors.push(...nestedErrors);
          } else {
            errors.push('Invalid condition in filter');
          }
        }
      } else {
        errors.push(`Unknown filter operator: ${key}`);
      }
    }

    return errors;
  }

  /**
   * Validate individual condition
   * @private
   */
  _validateCondition(condition) {
    const errors = [];

    // Check required properties
    if (!condition.field) {
      errors.push('Condition must have a field property');
    } else if (!ALLOWED_FIELDS.includes(condition.field)) {
      errors.push(`Invalid field: ${condition.field}`);
    }

    if (!condition.operator) {
      errors.push('Condition must have an operator property');
    } else if (!ALLOWED_OPERATORS.includes(condition.operator)) {
      errors.push(`Invalid operator: ${condition.operator}`);
    }

    if (condition.value === undefined && condition.operator !== 'exists') {
      errors.push('Condition must have a value property');
    }

    // Validate value types based on operator
    if (condition.operator === 'between') {
      if (!Array.isArray(condition.value) || condition.value.length !== 2) {
        errors.push('Between operator requires array of 2 values');
      }
    } else if (condition.operator === 'in') {
      if (!Array.isArray(condition.value)) {
        errors.push('In operator requires array of values');
      }
    } else if (condition.operator === 'exists') {
      if (typeof condition.value !== 'boolean') {
        errors.push('Exists operator requires boolean value');
      }
    } else {
      // Numeric operators
      if (typeof condition.value !== 'number' && typeof condition.value !== 'string') {
        errors.push(`Invalid value type for operator ${condition.operator}`);
      }
    }

    return errors;
  }

  /**
   * Validate sort clause
   * @private
   */
  _validateSort(sort) {
    const errors = [];

    if (!Array.isArray(sort)) {
      errors.push('Sort must be an array');
      return errors;
    }

    for (const sortItem of sort) {
      if (!sortItem.field) {
        errors.push('Sort item must have a field property');
      } else if (!ALLOWED_FIELDS.includes(sortItem.field)) {
        errors.push(`Invalid sort field: ${sortItem.field}`);
      }

      if (sortItem.direction && !['asc', 'desc'].includes(sortItem.direction.toLowerCase())) {
        errors.push(`Invalid sort direction: ${sortItem.direction}`);
      }
    }

    return errors;
  }

  /**
   * Validate limit clause
   * @private
   */
  _validateLimit(limit) {
    const errors = [];

    if (typeof limit !== 'number' || limit < 1 || limit > 1000) {
      errors.push('Limit must be a number between 1 and 1000');
    }

    return errors;
  }

  /**
   * Check if object is a condition
   * @private
   */
  _isCondition(obj) {
    return obj && typeof obj === 'object' && obj.field && obj.operator;
  }
}

module.exports = new DSLValidatorService();
