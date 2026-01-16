import { apiRequest } from './api/api';

const watchlistService = {
  /**
   * Get all watchlists for user
   */
  async getUserWatchlists() {
    try {
      const response = await apiRequest('GET', '/watchlists');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      throw error;
    }
  },

  /**
   * Get watchlist by ID
   */
  async getWatchlist(watchlistId) {
    try {
      const response = await apiRequest('GET', `/watchlists/${watchlistId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  },

  /**
   * Create new watchlist
   */
  async createWatchlist(name) {
    try {
      const response = await apiRequest('POST', '/watchlists', { name });
      return response.data;
    } catch (error) {
      console.error('Error creating watchlist:', error);
      throw error;
    }
  },

  /**
   * Update watchlist name
   */
  async updateWatchlistName(watchlistId, name) {
    try {
      const response = await apiRequest('PUT', `/watchlists/${watchlistId}`, { name });
      return response.data;
    } catch (error) {
      console.error('Error updating watchlist:', error);
      throw error;
    }
  },

  /**
   * Add stock to watchlist
   */
  async addToWatchlist(watchlistId, ticker, notes = null) {
    try {
      const response = await apiRequest('POST', `/watchlists/${watchlistId}/items`, {
        ticker,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  },

  /**
   * Remove stock from watchlist
   */
  async removeFromWatchlist(watchlistId, ticker) {
    try {
      const response = await apiRequest('DELETE', `/watchlists/${watchlistId}/items/${ticker}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },

  /**
   * Delete watchlist
   */
  async deleteWatchlist(watchlistId) {
    try {
      const response = await apiRequest('DELETE', `/watchlists/${watchlistId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      throw error;
    }
  }
};

export default watchlistService;
