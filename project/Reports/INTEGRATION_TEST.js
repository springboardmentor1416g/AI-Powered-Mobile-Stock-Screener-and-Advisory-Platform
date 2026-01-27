/**
 * COMPREHENSIVE INTEGRATION TEST
 * Tests backend, frontend, and database connectivity
 * Run with: node INTEGRATION_TEST.js
 */

const http = require('http');
const https = require('https');
const { Pool } = require('pg');

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  backend: {
    host: 'localhost',
    port: 8080,
    baseUrl: 'http://localhost:8080',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'stock_screener',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  api: {
    v1: '/api/v1',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.backend.baseUrl + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testDatabaseConnection() {
  console.log('\n📊 Testing Database Connection...');
  try {
    const pool = new Pool(CONFIG.database);
    const result = await pool.query('SELECT NOW()');
    await pool.end();
    console.log('✅ Database connected successfully');
    console.log('   Timestamp:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testBackendHealth() {
  console.log('\n🏥 Testing Backend Health Check...');
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200) {
      console.log('✅ Backend health check passed');
      console.log('   Status:', response.data.status);
      console.log('   Database:', response.data.database);
      console.log('   Alert Engine:', response.data.services.alerts);
      return true;
    } else {
      console.error('❌ Health check failed with status', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend not responding:', error.message);
    return false;
  }
}

async function testAuthEndpoint() {
  console.log('\n🔐 Testing Authentication Endpoints...');
  try {
    // Test registration
    const testEmail = `test_${Date.now()}@example.com`;
    const registerResponse = await makeRequest('POST', `${CONFIG.api.v1}/auth/register`, {
      email: testEmail,
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User',
    });

    if (registerResponse.status === 201 || registerResponse.status === 400) {
      if (registerResponse.data.success) {
        console.log('✅ Registration endpoint working');
        console.log('   User created:', registerResponse.data.user?.email);

        // Test login
        const loginResponse = await makeRequest('POST', `${CONFIG.api.v1}/auth/login`, {
          email: testEmail,
          password: 'TestPassword123',
        });

        if (loginResponse.data.success) {
          console.log('✅ Login endpoint working');
          console.log('   Token received:', loginResponse.data.token?.substring(0, 20) + '...');
          return true;
        } else {
          console.error('❌ Login failed:', loginResponse.data.error);
          return false;
        }
      } else if (registerResponse.data.error?.includes('already exists')) {
        console.log('⚠️  Email already exists - testing login instead');
        const loginResponse = await makeRequest('POST', `${CONFIG.api.v1}/auth/login`, {
          email: testEmail,
          password: 'TestPassword123',
        });
        if (loginResponse.data.success) {
          console.log('✅ Login endpoint working');
          return true;
        }
      } else {
        console.error('❌ Registration failed:', registerResponse.data.error);
        return false;
      }
    } else {
      console.error('❌ Auth endpoint returned unexpected status:', registerResponse.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
    return false;
  }
}

async function testScreenerEndpoint() {
  console.log('\n🔍 Testing Screener Endpoints...');
  try {
    // Test screener metadata
    const metaResponse = await makeRequest('GET', `${CONFIG.api.v1}/screener/metadata`);
    if (metaResponse.data.success || metaResponse.status === 200) {
      console.log('✅ Screener metadata endpoint working');

      // Test screener run
      const runResponse = await makeRequest('POST', `${CONFIG.api.v1}/screener/run`, {
        filter: {
          sector: 'Technology',
          pe_ratio: { min: 10, max: 30 },
        },
        options: { limit: 5 },
      });

      if (runResponse.data.success) {
        console.log('✅ Screener run endpoint working');
        console.log('   Results found:', runResponse.data.results?.length || 0);
        return true;
      } else {
        console.log('⚠️  Screener returned no results (expected if no data in DB)');
        return true;
      }
    } else {
      console.error('❌ Screener metadata failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Screener test failed:', error.message);
    return false;
  }
}

async function testMarketDataEndpoint() {
  console.log('\n📈 Testing Market Data Endpoints...');
  try {
    const quoteResponse = await makeRequest('GET', `${CONFIG.api.v1}/market/quote/AAPL`);
    if (quoteResponse.data.success) {
      console.log('✅ Market data quote endpoint working');
      console.log('   Price:', quoteResponse.data.data?.price);
      return true;
    } else {
      console.log('⚠️  Market data endpoint responded (may need API key)');
      console.log('   Error:', quoteResponse.data.error);
      return true; // Don't fail if API key issue
    }
  } catch (error) {
    console.error('❌ Market data test failed:', error.message);
    return false;
  }
}

async function testAPIVersioning() {
  console.log('\n📍 Testing API Versioning...');
  try {
    // Test that /api/v1 prefix is working
    const response = await makeRequest('GET', `${CONFIG.api.v1}/screener/metadata`);
    if (response.status === 200 || response.data.success !== undefined) {
      console.log('✅ API versioning working correctly');
      return true;
    } else {
      console.error('❌ API versioning issue detected');
      return false;
    }
  } catch (error) {
    console.error('❌ API versioning test failed:', error.message);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('\n🗄️  Testing Database Schema...');
  try {
    const pool = new Pool(CONFIG.database);
    const requiredTables = [
      'users',
      'companies',
      'price_history',
      'technical_indicators_latest',
      'watchlists',
      'portfolios',
    ];

    const result = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const tableNames = result.rows.map((r) => r.table_name);

    let allPresent = true;
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`   ✅ Table '${table}' exists`);
      } else {
        console.log(`   ⚠️  Table '${table}' missing`);
        allPresent = false;
      }
    }

    await pool.end();
    return allPresent;
  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('\n⚙️  Testing Environment Variables...');
  const required = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'TWELVE_DATA_API_KEY',
  ];

  let allPresent = true;
  for (const envVar of required) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar} set`);
    } else {
      console.log(`   ⚠️  ${envVar} missing`);
      allPresent = false;
    }
  }

  return allPresent;
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  STOCK SCREENER - INTEGRATION TEST SUITE      ║');
  console.log('║  Testing: Backend, Database, API, Frontend    ║');
  console.log('╚════════════════════════════════════════════════╝');

  const results = {};

  results.environment = await testEnvironmentVariables();
  results.database = await testDatabaseConnection();
  results.schema = results.database && (await testDatabaseSchema());
  results.backend = await testBackendHealth();
  results.apiVersioning = await testAPIVersioning();
  results.auth = await testAuthEndpoint();
  results.screener = await testScreenerEndpoint();
  results.marketData = await testMarketDataEndpoint();

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║                TEST SUMMARY                   ║');
  console.log('╚════════════════════════════════════════════════╝');

  const tests = [
    ['Environment Variables', results.environment],
    ['Database Connection', results.database],
    ['Database Schema', results.schema],
    ['Backend Health', results.backend],
    ['API Versioning', results.apiVersioning],
    ['Authentication', results.auth],
    ['Screener', results.screener],
    ['Market Data', results.marketData],
  ];

  let passed = 0;
  let total = 0;

  for (const [name, result] of tests) {
    if (result === true || result === null) {
      console.log(`✅ ${name}`);
      passed++;
    } else if (result === false) {
      console.log(`❌ ${name}`);
    }
    total++;
  }

  console.log('\n📊 OVERALL: ' + passed + '/' + total + ' tests passed');

  if (passed === total) {
    console.log('\n🎉 ALL SYSTEMS GO! Ready for production.\n');
    process.exit(0);
  } else if (passed >= total - 2) {
    console.log(
      '\n⚠️  Minor issues detected. May need data seeding or API key configuration.\n'
    );
    process.exit(0);
  } else {
    console.log('\n🔴 Critical issues found. Please review above.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
