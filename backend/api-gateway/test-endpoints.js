const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/v1';

async function testEndpoints() {
  console.log('Testing API Gateway Endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing GET /api/v1/health');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', JSON.stringify(healthResponse.data, null, 2));
    console.log('');

    // Test metadata/stocks endpoint
    console.log('2. Testing GET /api/v1/metadata/stocks');
    const stocksResponse = await axios.get(`${BASE_URL}/metadata/stocks?limit=10`);
    console.log('✅ Stocks Metadata:', JSON.stringify(stocksResponse.data, null, 2));
    console.log('');

    // Test metadata/sectors endpoint
    console.log('3. Testing GET /api/v1/metadata/sectors');
    const sectorsResponse = await axios.get(`${BASE_URL}/metadata/sectors`);
    console.log('✅ Sectors:', JSON.stringify(sectorsResponse.data, null, 2));
    console.log('');

    // Test metadata/exchanges endpoint
    console.log('4. Testing GET /api/v1/metadata/exchanges');
    const exchangesResponse = await axios.get(`${BASE_URL}/metadata/exchanges`);
    console.log('✅ Exchanges:', JSON.stringify(exchangesResponse.data, null, 2));
    console.log('');

    console.log('All tests passed! ✅');
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testEndpoints();
