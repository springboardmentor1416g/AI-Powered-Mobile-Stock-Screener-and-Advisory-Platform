import { apiRequest } from './api/api';

const portfolioService = {
  /**
   * Get user portfolio
   */
  async getPortfolio() {
    try {
      const response = await apiRequest('GET', '/portfolio');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },

  /**
   * Get portfolio entry by ticker
   */
  async getPortfolioEntry(ticker) {
    try {
      const response = await apiRequest('GET', `/portfolio/${ticker}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio entry:', error);
      throw error;
    }
  },

  /**
   * Add stock to portfolio
   */
  async addToPortfolio(ticker, quantity = null, avgPrice = null) {
    try {
      const payload = { ticker };
      if (quantity !== null) payload.quantity = quantity;
      if (avgPrice !== null) payload.avg_price = avgPrice;

      const response = await apiRequest('POST', '/portfolio', payload);
      return response.data;
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      throw error;
    }
  },

  /**
   * Update portfolio entry
   */
  async updatePortfolioEntry(ticker, quantity = null, avgPrice = null) {
    try {
      const payload = {};
      if (quantity !== null) payload.quantity = quantity;
      if (avgPrice !== null) payload.avg_price = avgPrice;

      const response = await apiRequest('PUT', `/portfolio/${ticker}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating portfolio entry:', error);
      throw error;
    }
  },

  /**
   * Remove stock from portfolio
   */
  async removeFromPortfolio(ticker) {
    try {
      const response = await apiRequest('DELETE', `/portfolio/${ticker}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from portfolio:', error);
      throw error;
    }
  }
};

export default portfolioService;
