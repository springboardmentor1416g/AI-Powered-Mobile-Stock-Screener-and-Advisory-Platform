import api from './api';

export const runScreener = async (query) => {
  const response = await api.post('/screener/run', {
    query,
  });
  return response.data;
};
