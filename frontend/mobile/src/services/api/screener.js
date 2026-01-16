import apiClient from '../apiClient';

export const runScreener = async (query) => {
  const response = await apiClient.post('/screener/run', {
    query,
  });
  return response.data;
};
