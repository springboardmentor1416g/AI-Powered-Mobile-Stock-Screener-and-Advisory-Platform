import apiClient from './apiClient';

const notificationService = {
  /**
   * Get user notifications
   */
  async getNotifications(options = {}) {
    try {
      let url = '/notifications';
      const params = new URLSearchParams();

      if (options.status) params.append('status', options.status);
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await apiClient.get(url);
      const notificationsData = response.data.data || response.data;
      return Array.isArray(notificationsData) ? notificationsData : [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get notification counts
   */
  async getNotificationCounts() {
    try {
      const response = await apiClient.get('/notifications/counts');
      // Counts endpoint returns {count: N, data: {unread, read, dismissed}} or just the counts object
      const countsData = response.data.data || response.data;
      return typeof countsData === 'object' ? countsData : {};
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      throw error;
    }
  },

  /**
   * Get single notification
   */
  async getNotification(notificationId) {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await apiClient.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Dismiss notification
   */
  async dismissNotification(notificationId) {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}/dismiss`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error dismissing notification:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

export default notificationService;
