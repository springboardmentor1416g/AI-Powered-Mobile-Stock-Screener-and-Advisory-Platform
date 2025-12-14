const request = require('supertest');
const app = require('../src/app');

describe('GET /api/v1/metadata/stocks', () => {
  it('returns stock metadata', async () => {
    const res = await request(app).get('/api/v1/metadata/stocks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
