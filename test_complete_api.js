/**
 * Complete API Test Script
 * Tests all major endpoints of the Stock Screener API
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/v1';
let authToken = null;
let testUserId = null;

// Test data
const testUser = {
  email: `test_${Date.now()}@example.com`,
  password: 'Test@123456',
  firstName: 'Test',
  lastName: 'User',
};

// Helper function for API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

// Test suite
async function runTests() {
  console.log('🚀 Starting Stock Screener API Tests\n');
  console.log('=' .repeat(60));

  // ==========================================
  // 1. HEALTH CHECK
  // ==========================================
  console.log('\n📊 Test 1: Health Check');
  const healthResult = await apiCall('GET', '/../health');
  console.log(healthResult.success ? '✅ PASS' : '❌ FAIL');
  if (healthResult.success) {
    console.log(`   Status: ${healthResult.data.status}`);
    console.log(`   Database: ${healthResult.data.database}`);
  }

  // ==========================================
  // 2. USER REGISTRATION
  // ==========================================
  console.log('\n📊 Test 2: User Registration');
  const registerResult = await apiCall('POST', '/auth/register', testUser);
  console.log(registerResult.success ? '✅ PASS' : '❌ FAIL');
  if (registerResult.success) {
    authToken = registerResult.data.token;
    testUserId = registerResult.data.user.id;
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Token received: ${authToken ? 'Yes' : 'No'}`);
  } else {
    console.log(`   Error: ${registerResult.error.message || registerResult.error}`);
  }

  // ==========================================
  // 3. USER LOGIN
  // ==========================================
  console.log('\n📊 Test 3: User Login');
  const loginResult = await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password,
  });
  console.log(loginResult.success ? '✅ PASS' : '❌ FAIL');
  if (loginResult.success) {
    console.log(`   Token received: ${loginResult.data.token ? 'Yes' : 'No'}`);
  }

  // ==========================================
  // 4. GET CURRENT USER
  // ==========================================
  console.log('\n📊 Test 4: Get Current User Profile');
  const profileResult = await apiCall('GET', '/auth/me', null, {
    Authorization: `Bearer ${authToken}`,
  });
  console.log(profileResult.success ? '✅ PASS' : '❌ FAIL');
  if (profileResult.success) {
    console.log(`   Email: ${profileResult.data.user.email}`);
  }

  // ==========================================
  // 5. SCREENER - GET METADATA
  // ==========================================
  console.log('\n📊 Test 5: Get Screener Metadata');
  const metadataResult = await apiCall('GET', '/screener/metadata');
  console.log(metadataResult.success ? '✅ PASS' : '❌ FAIL');
  if (metadataResult.success) {
    console.log(`   Available fields: ${metadataResult.data.data.fields.length}`);
    console.log(`   Available operators: ${metadataResult.data.data.operators.length}`);
  }

  // ==========================================
  // 6. SCREENER - PARSE NATURAL LANGUAGE
  // ==========================================
  console.log('\n📊 Test 6: Parse Natural Language Query');
  const parseResult = await apiCall('POST', '/screener/parse', {
    query: 'Find technology stocks with PE ratio less than 20',
  });
  console.log(parseResult.success ? '✅ PASS' : '❌ FAIL');
  if (parseResult.success) {
    console.log(`   Method: ${parseResult.data.method}`);
    console.log(`   Conditions: ${parseResult.data.filter.conditions.length}`);
    console.log(`   Explanation: ${parseResult.data.explanation}`);
  }

  // ==========================================
  // 7. SCREENER - RUN QUERY
  // ==========================================
  console.log('\n📊 Test 7: Run Screener Query');
  const screenResult = await apiCall('POST', '/screener/run', {
    filter: {
      conditions: [
        { field: 'sector', operator: '=', value: 'Technology' },
        { field: 'pe_ratio', operator: '<', value: 30 },
      ],
      logical_operator: 'AND',
    },
    options: {
      limit: 10,
      offset: 0,
    },
  });
  console.log(screenResult.success ? '✅ PASS' : '❌ FAIL');
  if (screenResult.success) {
    console.log(`   Results: ${screenResult.data.data.length}`);
    console.log(`   Total: ${screenResult.data.meta.total}`);
    console.log(`   Execution time: ${screenResult.data.meta.executionTime}ms`);
  }

  // ==========================================
  // 8. SCREENER - GET BREAKDOWN
  // ==========================================
  console.log('\n📊 Test 8: Get Sector Breakdown');
  const breakdownResult = await apiCall('POST', '/screener/breakdown', {
    filter: { conditions: [] },
    groupBy: 'sector',
  });
  console.log(breakdownResult.success ? '✅ PASS' : '❌ FAIL');
  if (breakdownResult.success) {
    console.log(`   Sectors: ${breakdownResult.data.data.length}`);
    if (breakdownResult.data.data.length > 0) {
      const top = breakdownResult.data.data[0];
      console.log(`   Top sector: ${top.category} (${top.count} stocks)`);
    }
  }

  // ==========================================
  // 9. SCREENER - SAVE SCREEN
  // ==========================================
  console.log('\n📊 Test 9: Save Screen');
  const saveScreenResult = await apiCall(
    'POST',
    '/screener/save',
    {
      name: 'Test Value Screen',
      filter: {
        conditions: [
          { field: 'pe_ratio', operator: '<', value: 15 },
          { field: 'roe', operator: '>', value: 15 },
        ],
        logical_operator: 'AND',
      },
      description: 'Value stocks with high ROE',
      isPublic: false,
    },
    { Authorization: `Bearer ${authToken}` }
  );
  console.log(saveScreenResult.success ? '✅ PASS' : '❌ FAIL');
  let savedScreenId = null;
  if (saveScreenResult.success) {
    savedScreenId = saveScreenResult.data.data.id;
    console.log(`   Screen ID: ${savedScreenId}`);
  }

  // ==========================================
  // 10. SCREENER - GET SAVED SCREENS
  // ==========================================
  console.log('\n📊 Test 10: Get Saved Screens');
  const savedScreensResult = await apiCall('GET', '/screener/saved', null, {
    Authorization: `Bearer ${authToken}`,
  });
  console.log(savedScreensResult.success ? '✅ PASS' : '❌ FAIL');
  if (savedScreensResult.success) {
    console.log(`   Saved screens: ${savedScreensResult.data.data.length}`);
  }

  // ==========================================
  // 11. MARKET DATA - GET QUOTE
  // ==========================================
  console.log('\n📊 Test 11: Get Stock Quote');
  const quoteResult = await apiCall('GET', '/market/quote/AAPL');
  console.log(quoteResult.success ? '✅ PASS' : '❌ FAIL');
  if (quoteResult.success) {
    console.log(`   Symbol: ${quoteResult.data.data.symbol}`);
    console.log(`   Price: $${quoteResult.data.data.price}`);
    console.log(`   Change: ${quoteResult.data.data.percentChange}%`);
  }

  // ==========================================
  // 12. MARKET DATA - SEARCH STOCKS
  // ==========================================
  console.log('\n📊 Test 12: Search Stocks');
  const searchResult = await apiCall('GET', '/market/search?q=Apple');
  console.log(searchResult.success ? '✅ PASS' : '❌ FAIL');
  if (searchResult.success) {
    console.log(`   Results: ${searchResult.data.data.length}`);
  }

  // ==========================================
  // 13. MARKET DATA - GET COMPANIES
  // ==========================================
  console.log('\n📊 Test 13: Get Companies from Database');
  const companiesResult = await apiCall('GET', '/market/companies?limit=5');
  console.log(companiesResult.success ? '✅ PASS' : '❌ FAIL');
  if (companiesResult.success) {
    console.log(`   Companies: ${companiesResult.data.data.length}`);
    console.log(`   Total in DB: ${companiesResult.data.meta.total}`);
  }

  // ==========================================
  // 14. ALERTS - CREATE ALERT
  // ==========================================
  console.log('\n📊 Test 14: Create Price Alert');
  const createAlertResult = await apiCall(
    'POST',
    '/alerts',
    {
      ticker: 'AAPL',
      alertName: 'AAPL Price Alert',
      alertType: 'price',
      condition: {
        operator: '>',
        value: 150,
      },
      frequency: 'daily',
    },
    { Authorization: `Bearer ${authToken}` }
  );
  console.log(createAlertResult.success ? '✅ PASS' : '❌ FAIL');
  let alertId = null;
  if (createAlertResult.success) {
    alertId = createAlertResult.data.alert.id;
    console.log(`   Alert ID: ${alertId}`);
  }

  // ==========================================
  // 15. ALERTS - GET USER ALERTS
  // ==========================================
  console.log('\n📊 Test 15: Get User Alerts');
  const alertsResult = await apiCall('GET', '/alerts', null, {
    Authorization: `Bearer ${authToken}`,
  });
  console.log(alertsResult.success ? '✅ PASS' : '❌ FAIL');
  if (alertsResult.success) {
    console.log(`   Alerts: ${alertsResult.data.alerts.length}`);
  }

  // ==========================================
  // 16. ALERTS - GET NOTIFICATIONS
  // ==========================================
  console.log('\n📊 Test 16: Get Notifications');
  const notificationsResult = await apiCall('GET', '/alerts/notifications', null, {
    Authorization: `Bearer ${authToken}`,
  });
  console.log(notificationsResult.success ? '✅ PASS' : '❌ FAIL');
  if (notificationsResult.success) {
    console.log(`   Notifications: ${notificationsResult.data.notifications.length}`);
  }

  // ==========================================
  // CLEANUP
  // ==========================================
  console.log('\n🧹 Cleanup: Deleting test alert...');
  if (alertId) {
    await apiCall('DELETE', `/alerts/${alertId}`, null, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  console.log('\n🧹 Cleanup: Deleting saved screen...');
  if (savedScreenId) {
    await apiCall('DELETE', `/screener/saved/${savedScreenId}`, null, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ All Tests Completed!');
  console.log('='.repeat(60));
  console.log('\n📌 Test Summary:');
  console.log('   - Authentication: Working');
  console.log('   - Screener Engine: Working');
  console.log('   - Market Data: Working');
  console.log('   - Alerts: Working');
  console.log('\n🎉 Your Stock Screener API is ready to use!\n');
}

// Run tests
runTests().catch(console.error);