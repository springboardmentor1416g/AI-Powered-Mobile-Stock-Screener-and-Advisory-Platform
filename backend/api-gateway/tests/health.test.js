const request = require('supertest');
const app = require('../src/app');

describe('GET /api/v1/health', () => {
  it('returns UP status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });
});

// Close any open connections after tests
afterAll(async () => {
  // Allow any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});

