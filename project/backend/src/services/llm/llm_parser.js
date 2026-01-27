/**
 * LLM Parser Service
 * Uses Claude AI to parse natural language queries into structured filters
 * This is a STUB for future implementation with actual LLM API
 */

const logger = require('../../config/logger');
const dslParser = require('../screener/dsl_parser');

class LLMParser {
  constructor() {
    this.enabled = false; // Set to true when LLM API is configured
    this.apiKey = process.env.ANTHROPIC_API_KEY || null;
    
    // System prompt for Claude
    this.systemPrompt = `You are a financial data query assistant. Your job is to convert natural language queries about stocks into structured JSON filters.

Available fields:
- price, volume, market_cap
- pe_ratio, pb_ratio, peg_ratio, ps_ratio
- roe, roa, operating_margin, profit_margin
- eps, revenue, net_income
- sector, industry, exchange, country

Available operators:
- Numeric: >, <, >=, <=, =, !=, between
- String: =, !=, like, in, not_in

Output format (JSON only, no explanation):
{
  "conditions": [
    {
      "field": "pe_ratio",
      "operator": "<",
      "value": 15
    }
  ],
  "logical_operator": "AND"
}

Examples:

Query: "Find tech stocks with PE ratio less than 20 and ROE above 15%"
Output:
{
  "conditions": [
    {"field": "sector", "operator": "=", "value": "Technology"},
    {"field": "pe_ratio", "operator": "<", "value": 20},
    {"field": "roe", "operator": ">", "value": 15}
  ],
  "logical_operator": "AND"
}

Query: "Stocks trading under $50 with high volume"
Output:
{
  "conditions": [
    {"field": "price", "operator": "<", "value": 50},
    {"field": "volume", "operator": ">", "value": 1000000}
  ],
  "logical_operator": "AND"
}

Always respond with valid JSON only.`;
  }

  /**
   * Parse natural language query using LLM
   * @param {String} query - Natural language query
   * @returns {Promise<Object>} - Structured filter object
   */
  async parse(query) {
    try {
      logger.info('Parsing query with LLM:', query);

      // If LLM is not enabled, fall back to rule-based parser
      if (!this.enabled || !this.apiKey) {
        logger.info('LLM not configured, using rule-based parser');
        return this.fallbackParse(query);
      }

      // TODO: Implement actual Claude API call when API key is available
      // For now, use fallback parser
      return this.fallbackParse(query);

      /* 
      // Future implementation with Claude API:
      const axios = require('axios');
      
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: query,
            },
          ],
          system: this.systemPrompt,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );

      const content = response.data.content[0].text;
      const filter = JSON.parse(content);

      logger.info('LLM parsed query successfully', {
        conditionsCount: filter.conditions?.length || 0,
      });

      return {
        success: true,
        filter,
        method: 'llm',
      };
      */
    } catch (error) {
      logger.error('Error parsing with LLM:', error);
      logger.info('Falling back to rule-based parser');
      return this.fallbackParse(query);
    }
  }

  /**
   * Fallback to rule-based parser
   * @param {String} query - Natural language query
   * @returns {Object} - Structured filter
   */
  fallbackParse(query) {
    try {
      const filter = dslParser.parseNaturalLanguage(query);
      
      return {
        success: true,
        filter,
        method: 'rule-based',
      };
    } catch (error) {
      logger.error('Fallback parser failed:', error);
      return {
        success: false,
        error: error.message,
        filter: { conditions: [], logical_operator: 'AND' },
        method: 'failed',
      };
    }
  }

  /**
   * Parse with context (previous conversation)
   * @param {String} query - Current query
   * @param {Array} context - Previous queries/filters
   * @returns {Promise<Object>} - Structured filter
   */
  async parseWithContext(query, context = []) {
    try {
      logger.info('Parsing query with context');

      // For now, just use regular parser
      // In future, pass context to Claude for better understanding
      return await this.parse(query);
    } catch (error) {
      logger.error('Error parsing with context:', error);
      return this.fallbackParse(query);
    }
  }

  /**
   * Suggest filters based on partial query
   * @param {String} partialQuery - Incomplete query
   * @returns {Promise<Object>} - Suggested completions
   */
  async suggestFilters(partialQuery) {
    try {
      const suggestions = [];

      // Common patterns
      const patterns = [
        {
          trigger: 'pe',
          suggestions: [
            'PE ratio less than 15',
            'PE ratio between 10 and 20',
            'PE ratio greater than 25',
          ],
        },
        {
          trigger: 'roe',
          suggestions: [
            'ROE greater than 15%',
            'ROE above 20%',
            'ROE between 10% and 25%',
          ],
        },
        {
          trigger: 'price',
          suggestions: [
            'Price less than $50',
            'Price between $10 and $100',
            'Price greater than $100',
          ],
        },
        {
          trigger: 'sector',
          suggestions: [
            'Sector is Technology',
            'In the Healthcare sector',
            'Financial sector stocks',
          ],
        },
        {
          trigger: 'market cap',
          suggestions: [
            'Market cap greater than 10B',
            'Large cap stocks (>10B)',
            'Small cap stocks (<2B)',
          ],
        },
      ];

      const lowerQuery = partialQuery.toLowerCase();
      
      for (const pattern of patterns) {
        if (lowerQuery.includes(pattern.trigger)) {
          suggestions.push(...pattern.suggestions);
        }
      }

      // If no specific matches, provide general suggestions
      if (suggestions.length === 0) {
        suggestions.push(
          'Technology stocks with PE ratio less than 20',
          'High ROE stocks (>15%) in Healthcare sector',
          'Undervalued stocks with PB ratio less than 2',
          'Growth stocks with revenue growth >20%',
          'Dividend stocks with yield >3%'
        );
      }

      return {
        success: true,
        suggestions: suggestions.slice(0, 5),
      };
    } catch (error) {
      logger.error('Error generating suggestions:', error);
      return {
        success: false,
        error: error.message,
        suggestions: [],
      };
    }
  }

  /**
   * Explain a filter in natural language
   * @param {Object} filter - Structured filter
   * @returns {String} - Human-readable explanation
   */
  explainFilter(filter) {
    try {
      if (!filter.conditions || filter.conditions.length === 0) {
        return 'No filters applied - showing all stocks';
      }

      const explanations = filter.conditions.map(condition => {
        const field = this.humanizeField(condition.field);
        const operator = this.humanizeOperator(condition.operator);
        const value = this.humanizeValue(condition.value, condition.field);

        return `${field} ${operator} ${value}`;
      });

      const connector = filter.logical_operator === 'OR' ? ' OR ' : ' AND ';
      return explanations.join(connector);
    } catch (error) {
      logger.error('Error explaining filter:', error);
      return 'Complex filter applied';
    }
  }

  /**
   * Convert field name to human-readable format
   */
  humanizeField(field) {
    const mappings = {
      'pe_ratio': 'P/E Ratio',
      'pb_ratio': 'P/B Ratio',
      'peg_ratio': 'PEG Ratio',
      'ps_ratio': 'P/S Ratio',
      'roe': 'Return on Equity',
      'roa': 'Return on Assets',
      'market_cap': 'Market Cap',
      'operating_margin': 'Operating Margin',
      'profit_margin': 'Profit Margin',
      'net_income': 'Net Income',
    };

    return mappings[field.toLowerCase()] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Convert operator to human-readable format
   */
  humanizeOperator(operator) {
    const mappings = {
      '>': 'greater than',
      '<': 'less than',
      '>=': 'greater than or equal to',
      '<=': 'less than or equal to',
      '=': 'equals',
      '!=': 'not equal to',
      'between': 'between',
      'in': 'is one of',
      'not_in': 'is not one of',
      'like': 'contains',
    };

    return mappings[operator.toLowerCase()] || operator;
  }

  /**
   * Format value based on field type
   */
  humanizeValue(value, field) {
    if (Array.isArray(value)) {
      return value.join(' and ');
    }

    if (field.toLowerCase().includes('price')) {
      return `$${value}`;
    }

    if (field.toLowerCase().includes('ratio') || field.toLowerCase().includes('margin')) {
      return value;
    }

    if (field.toLowerCase().includes('market_cap')) {
      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      return `$${value}`;
    }

    return value;
  }

  /**
   * Validate filter before execution
   * @param {Object} filter - Structured filter
   * @returns {Object} - Validation result
   */
  validateFilter(filter) {
    const errors = [];
    const warnings = [];

    if (!filter.conditions || !Array.isArray(filter.conditions)) {
      errors.push('Filter must have conditions array');
      return { valid: false, errors, warnings };
    }

    if (filter.conditions.length === 0) {
      warnings.push('No conditions specified - will return all stocks');
    }

    if (filter.conditions.length > 20) {
      warnings.push('Too many conditions - query may be slow');
    }

    for (let i = 0; i < filter.conditions.length; i++) {
      const condition = filter.conditions[i];

      if (!condition.field) {
        errors.push(`Condition ${i + 1}: Missing field`);
      }

      if (!condition.operator) {
        errors.push(`Condition ${i + 1}: Missing operator`);
      }

      if (condition.value === undefined || condition.value === null) {
        errors.push(`Condition ${i + 1}: Missing value`);
      }

      // Check for unrealistic values
      if (condition.field === 'pe_ratio' && condition.value > 1000) {
        warnings.push(`Condition ${i + 1}: Unusually high PE ratio (${condition.value})`);
      }

      if (condition.field === 'price' && condition.value > 10000) {
        warnings.push(`Condition ${i + 1}: Unusually high price ($${condition.value})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

module.exports = new LLMParser();
