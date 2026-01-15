const request = require('supertest');

jest.mock('../src/auth/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { userId: 'test-user-uuid-123' };
    next();
  };
});

jest.mock('../src/services/alert.service');
const alertService = require('../src/services/alert.service');
const app = require('../src/app');

describe('Alert Subscription Management API', () => {
  const testUserId = 'test-user-uuid-123';
  const mockToken = 'Bearer mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize all service methods as jest mocks with correct names
    alertService.createAlert = jest.fn();
    alertService.getUserAlerts = jest.fn();
    alertService.getAlert = jest.fn();
    alertService.updateAlert = jest.fn();
    alertService.deleteAlert = jest.fn();
    alertService.toggleAlert = jest.fn();
  });

  describe('POST /api/v1/alerts - Create Alert', () => {
    it('should create price alert successfully', async () => {
      alertService.createAlert.mockResolvedValueOnce({
        id: 1,
        user_id: testUserId,
        ticker: 'AAPL',
        alert_type: 'price',
        alert_rule: { field: 'close', operator: '<', value: 150 },
        status: 'active',
        created_at: '2025-01-15T10:00:00Z'
      });

      const res = await request(app)
        .post('/api/v1/alerts')
        .set('Authorization', mockToken)
        .send({
          ticker: 'AAPL',
          alertType: 'price',
          alertRule: { field: 'close', operator: '<', value: 150 }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticker).toBe('AAPL');
    });

    it('should create fundamental alert', async () => {
      alertService.createAlert.mockResolvedValueOnce({
        id: 2,
        ticker: 'MSFT',
        alert_type: 'fundamental',
        alert_rule: { field: 'pe_ratio', operator: '<', value: 25 },
        status: 'active'
      });

      const res = await request(app)
        .post('/api/v1/alerts')
        .set('Authorization', mockToken)
        .send({
          ticker: 'MSFT',
          alertType: 'fundamental',
          alertRule: { field: 'pe_ratio', operator: '<', value: 25 }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.alert_type).toBe('fundamental');
    });

    it('should return 400 for missing ticker', async () => {
      const error = new Error('Ticker required');
      error.statusCode = 400;
      alertService.createAlert.mockRejectedValueOnce(error);

      const res = await request(app)
        .post('/api/v1/alerts')
        .set('Authorization', mockToken)
        .send({ alertType: 'price' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/alerts - Get Alerts', () => {
    it('should retrieve all alerts', async () => {
      alertService.getUserAlerts.mockResolvedValueOnce([
        { id: 1, ticker: 'AAPL', status: 'active' },
        { id: 2, ticker: 'MSFT', status: 'inactive' }
      ]);

      const res = await request(app)
        .get('/api/v1/alerts')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('should filter alerts by status', async () => {
      alertService.getUserAlerts.mockResolvedValueOnce([
        { id: 1, ticker: 'AAPL', status: 'active' }
      ]);

      const res = await request(app)
        .get('/api/v1/alerts?status=active')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].status).toBe('active');
    });
  });

  describe('GET /api/v1/alerts/:id - Get Alert', () => {
    it('should retrieve alert by id', async () => {
      alertService.getAlert.mockResolvedValueOnce({
        id: 1,
        ticker: 'AAPL',
        alert_type: 'price',
        status: 'active'
      });

      const res = await request(app)
        .get('/api/v1/alerts/1')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.ticker).toBe('AAPL');
    });

    it('should return 404 for non-existent alert', async () => {
      alertService.getAlert.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/v1/alerts/999')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/v1/alerts/:id - Update Alert', () => {
    it('should update alert successfully', async () => {
      alertService.updateAlert.mockResolvedValueOnce({
        id: 1,
        ticker: 'AAPL',
        alert_rule: { field: 'close', operator: '<', value: 140 }
      });

      const res = await request(app)
        .put('/api/v1/alerts/1')
        .set('Authorization', mockToken)
        .send({
          alertRule: { field: 'close', operator: '<', value: 140 }
        });

      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/v1/alerts/:id - Delete Alert', () => {
    it('should delete alert successfully', async () => {
      alertService.deleteAlert.mockResolvedValueOnce({ success: true });

      const res = await request(app)
        .delete('/api/v1/alerts/1')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(200);
    });

    it('should return 404 when deleting non-existent alert', async () => {
      const error = new Error('Alert not found');
      error.statusCode = 404;
      alertService.deleteAlert.mockRejectedValueOnce(error);

      const res = await request(app)
        .delete('/api/v1/alerts/999')
        .set('Authorization', mockToken);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/alerts/:id/toggle - Toggle Alert Status', () => {
    it('should toggle alert status to inactive', async () => {
      alertService.toggleAlert.mockResolvedValueOnce({
        id: 1,
        status: 'inactive'
      });

      const res = await request(app)
        .patch('/api/v1/alerts/1/toggle')
        .set('Authorization', mockToken)
        .send({ active: false });

      expect(res.statusCode).toBe(200);
    });

    it('should toggle alert status to active', async () => {
      alertService.toggleAlert.mockResolvedValueOnce({
        id: 1,
        status: 'active'
      });

      const res = await request(app)
        .patch('/api/v1/alerts/1/toggle')
        .set('Authorization', mockToken)
        .send({ active: true });

      expect(res.statusCode).toBe(200);
    });
  });

  describe('Complex Alert Scenarios', () => {
    it('should handle composite AND logic', async () => {
      alertService.createAlert.mockResolvedValueOnce({
        id: 5,
        ticker: 'AMZN',
        alert_rule: {
          and: [
            { field: 'pe_ratio', operator: '<', value: 30 },
            { field: 'revenue_growth', operator: '>', value: 15 }
          ]
        }
      });

      const res = await request(app)
        .post('/api/v1/alerts')
        .set('Authorization', mockToken)
        .send({
          ticker: 'AMZN',
          alertRule: {
            and: [
              { field: 'pe_ratio', operator: '<', value: 30 },
              { field: 'revenue_growth', operator: '>', value: 15 }
            ]
          }
        });

      expect(res.statusCode).toBe(201);
    });
  });
});

// Close any open connections after tests
afterAll(async () => {
  // Allow any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});

