const axios = require('axios');
const logger = require('../../config/logger');
const config = require('../../config/environment');

class TwelveDataService {
  constructor() {
    this.baseURL = config.TWELVE_DATA_BASE_URL;
    this.apiKey = config.TWELVE_DATA_API_KEY;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      params: {
        apikey: this.apiKey,
      },
    });
  }

  /**
   * Fetch stock quote (real-time or delayed)
   * @param {string} symbol - Stock symbol (e.g., 'AAPL', 'TCS.NSE')
   */
  async getQuote(symbol) {
    try {
      logger.info(`Fetching quote for ${symbol}`);
      
      const response = await this.client.get('/quote', {
        params: {
          symbol: symbol,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: {
          symbol: response.data.symbol,
          name: response.data.name,
          exchange: response.data.exchange,
          currency: response.data.currency,
          price: parseFloat(response.data.close),
          open: parseFloat(response.data.open),
          high: parseFloat(response.data.high),
          low: parseFloat(response.data.low),
          volume: parseInt(response.data.volume),
          previousClose: parseFloat(response.data.previous_close),
          change: parseFloat(response.data.change),
          percentChange: parseFloat(response.data.percent_change),
          timestamp: response.data.datetime,
        },
      };
    } catch (error) {
      logger.error(`Error fetching quote for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch time series data (OHLCV)
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval (1min, 5min, 15min, 30min, 45min, 1h, 2h, 4h, 1day, 1week, 1month)
   * @param {number} outputsize - Number of data points (max 5000)
   */
  async getTimeSeries(symbol, interval = '1day', outputsize = 365) {
    try {
      logger.info(`Fetching time series for ${symbol} - interval: ${interval}`);
      
      const response = await this.client.get('/time_series', {
        params: {
          symbol: symbol,
          interval: interval,
          outputsize: outputsize,
          format: 'JSON',
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      const values = response.data.values || [];
      
      return {
        success: true,
        data: values.map(item => ({
          datetime: item.datetime,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseInt(item.volume),
        })),
        meta: {
          symbol: response.data.meta?.symbol,
          interval: response.data.meta?.interval,
          currency: response.data.meta?.currency,
          exchange: response.data.meta?.exchange,
        },
      };
    } catch (error) {
      logger.error(`Error fetching time series for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch company profile/overview
   * @param {string} symbol - Stock symbol
   */
  async getProfile(symbol) {
    try {
      logger.info(`Fetching profile for ${symbol}`);
      
      const response = await this.client.get('/profile', {
        params: {
          symbol: symbol,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: {
          symbol: response.data.symbol,
          name: response.data.name,
          sector: response.data.sector,
          industry: response.data.industry,
          exchange: response.data.exchange,
          country: response.data.country,
          currency: response.data.currency,
          website: response.data.website,
          description: response.data.description,
          ceo: response.data.ceo,
          employees: response.data.employees,
          phone: response.data.phone,
          address: response.data.address,
          city: response.data.city,
          state: response.data.state,
          zip: response.data.zip,
        },
      };
    } catch (error) {
      logger.error(`Error fetching profile for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch statistics (key metrics)
   * @param {string} symbol - Stock symbol
   */
  async getStatistics(symbol) {
    try {
      logger.info(`Fetching statistics for ${symbol}`);
      
      const response = await this.client.get('/statistics', {
        params: {
          symbol: symbol,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      const stats = response.data.statistics;

      return {
        success: true,
        data: {
          symbol: response.data.symbol,
          marketCap: stats.valuations_metrics?.market_capitalization,
          peRatio: stats.valuations_metrics?.price_to_earnings_ttm,
          pegRatio: stats.valuations_metrics?.peg_ratio,
          pbRatio: stats.valuations_metrics?.price_to_book_mrq,
          psRatio: stats.valuations_metrics?.price_to_sales_ttm,
          dividendYield: stats.dividends_and_splits?.dividend_yield,
          eps: stats.financials_metrics?.basic_eps_ttm,
          beta: stats.stock_statistics?.beta,
          sharesOutstanding: stats.stock_statistics?.shares_outstanding,
          sharesFloat: stats.stock_statistics?.shares_float,
          week52High: stats.stock_price_summary?.fifty_two_week_high,
          week52Low: stats.stock_price_summary?.fifty_two_week_low,
        },
      };
    } catch (error) {
      logger.error(`Error fetching statistics for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch income statement
   * @param {string} symbol - Stock symbol
   * @param {string} period - 'annual' or 'quarterly'
   */
  async getIncomeStatement(symbol, period = 'quarterly') {
    try {
      logger.info(`Fetching income statement for ${symbol} - period: ${period}`);
      
      const response = await this.client.get('/income_statement', {
        params: {
          symbol: symbol,
          period: period,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: response.data.income_statement || [],
        meta: {
          symbol: response.data.symbol,
          period: period,
        },
      };
    } catch (error) {
      logger.error(`Error fetching income statement for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch balance sheet
   * @param {string} symbol - Stock symbol
   * @param {string} period - 'annual' or 'quarterly'
   */
  async getBalanceSheet(symbol, period = 'quarterly') {
    try {
      logger.info(`Fetching balance sheet for ${symbol} - period: ${period}`);
      
      const response = await this.client.get('/balance_sheet', {
        params: {
          symbol: symbol,
          period: period,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: response.data.balance_sheet || [],
        meta: {
          symbol: response.data.symbol,
          period: period,
        },
      };
    } catch (error) {
      logger.error(`Error fetching balance sheet for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch cash flow statement
   * @param {string} symbol - Stock symbol
   * @param {string} period - 'annual' or 'quarterly'
   */
  async getCashFlow(symbol, period = 'quarterly') {
    try {
      logger.info(`Fetching cash flow for ${symbol} - period: ${period}`);
      
      const response = await this.client.get('/cash_flow', {
        params: {
          symbol: symbol,
          period: period,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: response.data.cash_flow || [],
        meta: {
          symbol: response.data.symbol,
          period: period,
        },
      };
    } catch (error) {
      logger.error(`Error fetching cash flow for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch earnings calendar
   * @param {string} symbol - Stock symbol (optional)
   */
  async getEarnings(symbol = null) {
    try {
      logger.info(`Fetching earnings${symbol ? ` for ${symbol}` : ''}`);
      
      const params = {};
      if (symbol) {
        params.symbol = symbol;
      }

      const response = await this.client.get('/earnings_calendar', {
        params: params,
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: response.data.earnings || [],
      };
    } catch (error) {
      logger.error('Error fetching earnings:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch dividends
   * @param {string} symbol - Stock symbol
   */
  async getDividends(symbol) {
    try {
      logger.info(`Fetching dividends for ${symbol}`);
      
      const response = await this.client.get('/dividends', {
        params: {
          symbol: symbol,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: response.data.dividends || [],
      };
    } catch (error) {
      logger.error(`Error fetching dividends for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch stock splits
   * @param {string} symbol - Stock symbol
   */
  async getSplits(symbol) {
    try {
      logger.info(`Fetching splits for ${symbol}`);
      
      const response = await this.client.get('/splits', {
        params: {
          symbol: symbol,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: response.data.splits || [],
      };
    } catch (error) {
      logger.error(`Error fetching splits for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search/lookup stocks
   * @param {string} query - Search query
   */
  async searchStocks(query) {
    try {
      logger.info(`Searching stocks: ${query}`);
      
      const response = await this.client.get('/symbol_search', {
        params: {
          symbol: query,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      logger.error(`Error searching stocks:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get earliest available date for a symbol
   * @param {string} symbol - Stock symbol
   */
  async getEarliestTimestamp(symbol) {
    try {
      const response = await this.client.get('/earliest_timestamp', {
        params: {
          symbol: symbol,
          interval: '1day',
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: {
          datetime: response.data.datetime,
          unix_time: response.data.unix_time,
        },
      };
    } catch (error) {
      logger.error(`Error fetching earliest timestamp for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get technical indicators
   * @param {string} symbol - Stock symbol
   * @param {string} indicator - Indicator name (sma, ema, rsi, macd, etc.)
   * @param {object} params - Additional parameters
   */
  async getTechnicalIndicator(symbol, indicator, params = {}) {
    try {
      logger.info(`Fetching ${indicator} for ${symbol}`);
      
      const response = await this.client.get(`/${indicator}`, {
        params: {
          symbol: symbol,
          interval: params.interval || '1day',
          time_period: params.time_period || 14,
          ...params,
        },
      });

      if (response.data.status === 'error') {
        throw new Error(response.data.message || 'API returned error');
      }

      return {
        success: true,
        data: response.data.values || [],
        meta: response.data.meta || {},
      };
    } catch (error) {
      logger.error(`Error fetching ${indicator} for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new TwelveDataService();