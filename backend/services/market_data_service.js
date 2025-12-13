const axios = require('axios');

const BASE_URL = process.env.MARKETDATA_BASE_URL;
const API_KEY = process.env.MARKETDATA_API_KEY;

console.log('market_data_service loaded', { BASE_URL, hasKey: !!API_KEY });

async function fetchDailyOHLCV(symbol) {
  const response = await axios.get(`${BASE_URL}/query`, {
    params: {
      function: 'TIME_SERIES_DAILY',
      symbol,
      apikey: API_KEY,
      outputsize: 'compact'
    }
  });
  return response.data;
}

async function fetchCompanyOverview(symbol) {
  const response = await axios.get(`${BASE_URL}/query`, {
    params: {
      function: 'OVERVIEW',
      symbol,
      apikey: API_KEY
    }
  });
  return response.data;
}

module.exports = {
  fetchDailyOHLCV,
  fetchCompanyOverview
};
