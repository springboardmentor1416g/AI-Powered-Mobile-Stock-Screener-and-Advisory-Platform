import axios from 'axios';

// 🔧 CONFIG: Update IP as needed
const BASE_URL = 'http://localhost:4000/api'; 

const api = axios.create({ baseURL: BASE_URL });

export const MarketService = {
  getCompanyDetails: async (ticker: string) => {
    const response = await api.get(`/stocks/${ticker}`);
    return response.data;
  },
  getPriceHistory: async (ticker: string, range: string = '1Y') => {
    const response = await api.get(`/stocks/${ticker}/history?range=${range}`);
    return response.data;
  }
};

export const UserDataService = {
  addToWatchlist: async (userId: string, ticker: string) => {
    return api.post('/watchlist/add', { userId, ticker });
  },

  getWatchlist: async (userId: string) => {
    const response = await api.get(`/watchlist/${userId}`);
    return response.data;
  },

  removeFromWatchlist: async (userId: string, ticker: string) => {
    return api.delete('/watchlist/remove', { 
      data: { userId, ticker } 
    });
  },

  getPortfolio: async (userId: string) => {
    const response = await api.get(`/portfolio/${userId}`);
    return response.data;
  },

  // ✅ ADD THIS FUNCTION
  createAlert: async (alertData: any) => {
    return api.post('/alerts/create', alertData);
  }
};