const request = require('supertest');
const app = require('../src/app');

describe('Global error handling', () => {
  it('should return standardized error for unknown route', async () => {
    const res = await request(app).get('/api/v1/unknown-route');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error_code');
  });
});
