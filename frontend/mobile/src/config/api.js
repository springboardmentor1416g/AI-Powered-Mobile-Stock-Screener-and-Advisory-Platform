import BACKEND_URL from './backend-config';

const API_BASE_URL = __DEV__ 
  ? `${BACKEND_URL}/api/v1`
  : 'https://api.stockscreener.com/api/v1';

console.log('📡 API Base URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  HEALTH: '/health',
  WATCHLISTS: '/watchlists',
  WATCHLIST_ITEMS: (id) => `/watchlists/${id}/items`,
  PORTFOLIO: '/portfolio',
  ALERTS: '/alerts',
  NOTIFICATIONS: '/notifications',
  SCREENER: '/screener',
};

export default API_BASE_URL;
