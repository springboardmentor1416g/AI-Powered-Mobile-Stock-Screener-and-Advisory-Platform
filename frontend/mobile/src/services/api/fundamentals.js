import api from './api';

/**
 * Fetch company fundamentals (quarterly, TTM, trends)
 */
export const getCompanyFundamentals = async (ticker) => {
  const response = await api.get(`/screener/fundamentals/${ticker}`);
  return response.data;
};
