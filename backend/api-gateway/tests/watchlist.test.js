const request = require('supertest');

jest.mock('../src/auth/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { userId: 'test-user-uuid-123' };
    next();
  };
});

jest.mock('../src/services/watchlist.service');
const watchlistService = require('../src/services/watchlist.service');
const app = require('../src/app');

describe('Watchlist Management API', () => {
  const testUserId = 'test-user-uuid-123';
  const mockToken = 'Bearer mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize all service methods as jest mocks
    watchlistService.createWatchlist = jest.fn();
    watchlistService.getUserWatchlists = jest.fn();
    watchlistService.getWatchlist = jest.fn();
    watchlistService.updateWatchlistName = jest.fn();
    watchlistService.deleteWatchlist = jest.fn();
    watchlistService.addToWatchlist = jest.fn();
    watchlistService.removeFromWatchlist = jest.fn();
  });

  describe('POST /api/v1/watchlists - Create Watchlist', () => {
    it('should create watchlist successfully', async () => {
      watchlistService.createWatchlist.mockResolvedValueOnce({
        id: 1,
        user_id: testUserId,
        name: 'Tech Stocks',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      });

      const res = await request(app)
        .post('/api/v1/watchlists')
        .set('Authorization', mockToken)
        .send({ name: 'Tech Stocks' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Tech Stocks');
    });

    it('should return 409 for duplicate watchlist', async () => {
      const error = new Error('Watchlist already exists');
      error.statusCode = 409;
      watchlistService.createWatchlist.mockRejectedValueOnce(error);

      const res = await request(app)
        .post('/api/v1/watchlists')
        .set('Authorization', mockToken)
        .send({ name: 'Tech Stocks' });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('GET /api/v1/watchlists - Get Watchlists', () => {
    it('should retrieve all watchlists', async () => {
      watchlistService.getUserWatchlists.mockResolvedValueOnce([
        { id: 1, name: 'Tech Stocks' },
        { id: 2, name: 'Growth' }
      ]);

      const res = await request(app)
        .get('/api/v1/watchlists')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/v1/watchlists/:id - Get Watchlist', () => {
    it('should retrieve watchlist by id', async () => {
      watchlistService.getWatchlist.mockResolvedValueOnce({
        id: 1,
        name: 'Tech Stocks',
        items: [{ ticker: 'AAPL' }]
      });

      const res = await request(app)
        .get('/api/v1/watchlists/1')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Tech Stocks');
    });

    it('should return 404 for non-existent watchlist', async () => {
      watchlistService.getWatchlist.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/v1/watchlists/999')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/v1/watchlists/:id - Update Watchlist', () => {
    it('should update watchlist', async () => {
      watchlistService.updateWatchlistName.mockResolvedValueOnce({
        id: 1,
        name: 'Updated Tech'
      });

      const res = await request(app)
        .put('/api/v1/watchlists/1')
        .set('Authorization', mockToken)
        .send({ name: 'Updated Tech' });

      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/v1/watchlists/:id - Delete Watchlist', () => {
    it('should delete watchlist', async () => {
      watchlistService.deleteWatchlist.mockResolvedValueOnce({ success: true });

      const res = await request(app)
        .delete('/api/v1/watchlists/1')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /api/v1/watchlists/:id/items - Add Item', () => {
    it('should add item to watchlist', async () => {
      watchlistService.addToWatchlist.mockResolvedValueOnce({
        id: 1,
        ticker: 'AAPL'
      });

      const res = await request(app)
        .post('/api/v1/watchlists/1/items')
        .set('Authorization', mockToken)
        .send({ ticker: 'AAPL' });

      expect(res.statusCode).toBe(201);
    });

    it('should return 409 for duplicate item', async () => {
      const error = new Error('Stock already in watchlist');
      error.statusCode = 409;
      watchlistService.addToWatchlist.mockRejectedValueOnce(error);

      const res = await request(app)
        .post('/api/v1/watchlists/1/items')
        .set('Authorization', mockToken)
        .send({ ticker: 'AAPL' });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('DELETE /api/v1/watchlists/:id/items/:ticker - Remove Item', () => {
    it('should remove item from watchlist', async () => {
      watchlistService.removeFromWatchlist.mockResolvedValueOnce({
        success: true
      });

      const res = await request(app)
        .delete('/api/v1/watchlists/1/items/AAPL')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
    });

    it('should return 404 when item not found', async () => {
      const error = new Error('Stock not found');
      error.statusCode = 404;
      watchlistService.removeFromWatchlist.mockRejectedValueOnce(error);

      const res = await request(app)
        .delete('/api/v1/watchlists/1/items/NOTFOUND')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(404);
    });
  });
});

// Close any open connections after tests
afterAll(async () => {
  // Allow any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});

