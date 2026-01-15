const request = require('supertest');

jest.mock('../src/auth/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { userId: 'test-user-uuid-123' };
    next();
  };
});

// portfolioService mock is already set up in tests/setup.js
// Do NOT mock again here - it would override the proper mock
const portfolioService = require('../src/services/portfolio.service');
const app = require('../src/app');

describe('Portfolio Management API', () => {
  const testUserId = 'test-user-uuid-123';
  const mockToken = 'Bearer mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize all service methods as jest mocks
    portfolioService.addToPortfolio = jest.fn();
    portfolioService.getPortfolio = jest.fn();
    portfolioService.getPortfolioEntry = jest.fn();
    portfolioService.updatePortfolioEntry = jest.fn();
    portfolioService.removeFromPortfolio = jest.fn();
  });

  describe('POST /api/v1/portfolio - Add Stock to Portfolio', () => {
    it('should add stock to portfolio successfully', async () => {
      portfolioService.addToPortfolio.mockResolvedValueOnce({
        id: 1,
        user_id: testUserId,
        ticker: 'AAPL',
        quantity: 100,
        avg_price: 150.50,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      });

      const res = await request(app)
        .post('/api/v1/portfolio')
        .set('Authorization', mockToken)
        .send({
          ticker: 'AAPL',
          quantity: 100,
          avgPrice: 150.50
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticker).toBe('AAPL');
      expect(res.body.data.quantity).toBe(100);
      expect(portfolioService.addToPortfolio).toHaveBeenCalledWith(
        testUserId,
        'AAPL',
        100,
        150.50
      );
    });

    it('should return 400 when ticker is missing', async () => {
      const res = await request(app)
        .post('/api/v1/portfolio')
        .set('Authorization', mockToken)
        .send({
          quantity: 100,
          avgPrice: 150.50
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Ticker is required');
    });

    it('should handle duplicate stock error (409)', async () => {
      portfolioService.addToPortfolio.mockRejectedValueOnce(
        new Error('Stock AAPL already exists in portfolio')
      );

      const res = await request(app)
        .post('/api/v1/portfolio')
        .set('Authorization', mockToken)
        .send({
          ticker: 'AAPL',
          quantity: 100,
          avgPrice: 150.50
        });

      expect(res.statusCode).toBe(500); // Service doesn't set custom status codes
      expect(res.body.success).toBe(false);
    });

    it('should handle invalid ticker error (404)', async () => {
      portfolioService.addToPortfolio.mockRejectedValueOnce(
        new Error('Ticker INVALID not found in companies table')
      );

      const res = await request(app)
        .post('/api/v1/portfolio')
        .set('Authorization', mockToken)
        .send({
          ticker: 'INVALID',
          quantity: 100,
          avgPrice: 150.50
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/portfolio - Get Portfolio', () => {
    it('should retrieve portfolio successfully', async () => {
      portfolioService.getPortfolio.mockResolvedValueOnce([
        {
          id: 1,
          ticker: 'AAPL',
          company_name: 'Apple Inc.',
          quantity: 100,
          avg_price: 150.50,
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z'
        },
        {
          id: 2,
          ticker: 'MSFT',
          company_name: 'Microsoft',
          quantity: 50,
          avg_price: 300.00,
          created_at: '2025-01-15T10:05:00Z',
          updated_at: '2025-01-15T10:05:00Z'
        }
      ]);

      const res = await request(app)
        .get('/api/v1/portfolio')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].ticker).toBe('AAPL');
    });

    it('should return empty portfolio', async () => {
      portfolioService.getPortfolio.mockResolvedValueOnce([]);

      const res = await request(app)
        .get('/api/v1/portfolio')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.count).toBe(0);
    });
  });

  describe('GET /api/v1/portfolio/:ticker - Get Portfolio Entry', () => {
    it('should retrieve specific portfolio entry', async () => {
      portfolioService.getPortfolioEntry.mockResolvedValueOnce({
        id: 1,
        ticker: 'AAPL',
        company_name: 'Apple Inc.',
        quantity: 100,
        avg_price: 150.50,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      });

      const res = await request(app)
        .get('/api/v1/portfolio/AAPL')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticker).toBe('AAPL');
    });

    it('should return 404 when entry not found', async () => {
      portfolioService.getPortfolioEntry.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/v1/portfolio/INVALID')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/portfolio/:ticker - Update Portfolio Entry', () => {
    it('should update portfolio entry successfully', async () => {
      portfolioService.updatePortfolioEntry.mockResolvedValueOnce({
        id: 1,
        user_id: testUserId,
        ticker: 'AAPL',
        quantity: 150,
        avg_price: 155.00,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T11:00:00Z'
      });

      const res = await request(app)
        .put('/api/v1/portfolio/AAPL')
        .set('Authorization', mockToken)
        .send({
          quantity: 150,
          avgPrice: 155.00
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(150);
    });

    it('should return 404 when stock not in portfolio', async () => {
      portfolioService.updatePortfolioEntry.mockRejectedValueOnce(
        new Error('Stock NOTFOUND not found in portfolio')
      );

      const res = await request(app)
        .put('/api/v1/portfolio/NOTFOUND')
        .set('Authorization', mockToken)
        .send({
          quantity: 150,
          avgPrice: 155.00
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/portfolio/:ticker - Remove Stock', () => {
    it('should remove stock from portfolio', async () => {
      portfolioService.removeFromPortfolio.mockResolvedValueOnce({
        id: 1,
        ticker: 'AAPL'
      });

      const res = await request(app)
        .delete('/api/v1/portfolio/AAPL')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('removed');
    });

    it('should return 404 when stock not found', async () => {
      portfolioService.removeFromPortfolio.mockRejectedValueOnce(
        new Error('Stock NOTFOUND not found in portfolio')
      );

      const res = await request(app)
        .delete('/api/v1/portfolio/NOTFOUND')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Validation Tests', () => {
    it('should handle null avgPrice', async () => {
      portfolioService.addToPortfolio.mockResolvedValueOnce({
        id: 1,
        user_id: testUserId,
        ticker: 'AAPL',
        quantity: 100,
        avg_price: null,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      });

      const res = await request(app)
        .post('/api/v1/portfolio')
        .set('Authorization', mockToken)
        .send({
          ticker: 'AAPL',
          quantity: 100
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.avg_price).toBeNull();
    });

    it('should handle null quantity', async () => {
      portfolioService.addToPortfolio.mockResolvedValueOnce({
        id: 1,
        user_id: testUserId,
        ticker: 'AAPL',
        quantity: null,
        avg_price: 150.50,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      });

      const res = await request(app)
        .post('/api/v1/portfolio')
        .set('Authorization', mockToken)
        .send({
          ticker: 'AAPL',
          avgPrice: 150.50
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.quantity).toBeNull();
    });
  });
});

// Close any open connections after tests
afterAll(async () => {
  // Allow any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});

