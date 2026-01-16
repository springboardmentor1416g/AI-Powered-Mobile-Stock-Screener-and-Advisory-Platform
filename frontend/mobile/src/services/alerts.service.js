import { apiRequest } from './api/api';

const alertService = {
  /**
   * Get user alerts
   */
  async getUserAlerts(options = {}) {
    try {
      let url = '/alerts';
      const params = new URLSearchParams();
      
      if (options.status) params.append('status', options.status);
      if (options.alertType) params.append('alertType', options.alertType);
      if (options.ticker) params.append('ticker', options.ticker);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await apiRequest('GET', url);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  /**
   * Get alert by ID
   */
  async getAlert(alertId) {
    try {
      const response = await apiRequest('GET', `/alerts/${alertId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alert:', error);
      throw error;
    }
  },

  /**
   * Create alert
   */
  async createAlert(ticker, alertRule, options = {}) {
    try {
      const payload = {
        ticker,
        alertRule,
        ...options
      };

      const response = await apiRequest('POST', '/alerts', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },

  /**
   * Update alert
   */
  async updateAlert(alertId, updates) {
    try {
      const response = await apiRequest('PUT', `/alerts/${alertId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  },

  /**
   * Toggle alert (enable/disable)
   */
  async toggleAlert(alertId, active) {
    try {
      const response = await apiRequest('PATCH', `/alerts/${alertId}/toggle`, { active });
      return response.data;
    } catch (error) {
      console.error('Error toggling alert:', error);
      throw error;
    }
  },

  /**
   * Delete alert
   */
  async deleteAlert(alertId) {
    try {
      const response = await apiRequest('DELETE', `/alerts/${alertId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }
};

export default alertService;
