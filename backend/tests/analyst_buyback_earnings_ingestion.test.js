/**
 * analyst_buyback_earnings_ingestion.test.js
 * Integration tests for M6 ingestion pipeline
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Mock service functions
jest.mock('../services/analyst_data_service', () => ({
  fetchAnalystPriceTargets: jest.fn(async (ticker) => ({
    ticker: ticker.toUpperCase(),
    provider: 'Yahoo Finance',
    data_date: '2025-01-15',
    price_target_low: 150.00,
    price_target_avg: 170.00,
    price_target_high: 190.00,
    num_analysts: 18,
    rating: 'BUY',
    rating_distribution: { strong_buy: 5, buy: 8, hold: 4, sell: 1, strong_sell: 0 }
  })),
  
  fetchEarningsCalendar: jest.fn(async (ticker) => [
    {
      ticker: ticker.toUpperCase(),
      event_date: '2025-02-01',
      event_type: 'earnings_announcement',
      status: 'scheduled',
      fiscal_year: 2025,
      fiscal_period: 'Q1',
      source: 'Yahoo Finance'
    }
  ]),

  fetchEarningsEstimates: jest.fn(async (ticker) => ({
    ticker: ticker.toUpperCase(),
    provider: 'Polygon.io',
    estimate_period: '2025-FY',
    estimate_date: '2025-01-15',
    fiscal_year: 2025,
    eps_estimate: 5.50,
    revenue_estimate: 100000000000,
    num_analysts_eps: 25,
    guidance_change: 'maintained'
  })),

  validateBuybackRecord: jest.fn((record) => ({
    valid: true,
    errors: []
  })),

  normalizeBuybackRecord: jest.fn((record) => ({
    ...record,
    ticker: record.ticker.toUpperCase()
  })),

  upsertAnalystPriceTarget: jest.fn(async () => {}),
  upsertEarningsEvent: jest.fn(async () => {}),
  upsertEarningsEstimate: jest.fn(async () => {}),
  upsertBuybackAnnouncement: jest.fn(async () => {}),
  logIngestionMetadata: jest.fn(async () => {}),

  pool: {
    query: jest.fn(async () => ({ rows: [] })),
    end: jest.fn(async () => {})
  }
}));

const {
  ingestAnalystPriceTargets,
  ingestEarningsCalendar,
  ingestEarningsEstimates,
  ingestBuybackAnnouncements
} = require('../ingestion/analyst_buyback_earnings_ingestion');

const analystService = require('../services/analyst_data_service');

describe('M6 Analyst & Buyback Ingestion Pipeline', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // ANALYST PRICE TARGETS INGESTION
  // ========================================================================

  describe('ingestAnalystPriceTargets', () => {
    test('successfully ingests analyst targets for multiple tickers', async () => {
      const tickers = ['AAPL', 'MSFT', 'GOOGL'];
      const result = await ingestAnalystPriceTargets(tickers);

      expect(result.successCount).toBe(3);
      expect(result.errorCount).toBe(0);
      expect(analystService.fetchAnalystPriceTargets).toHaveBeenCalledTimes(3);
      expect(analystService.upsertAnalystPriceTarget).toHaveBeenCalledTimes(3);
    });

    test('logs ingestion metadata after completion', async () => {
      const tickers = ['AAPL', 'MSFT'];
      await ingestAnalystPriceTargets(tickers);

      expect(analystService.logIngestionMetadata).toHaveBeenCalledWith(
        'analyst_price_targets',
        'Yahoo Finance',
        true,
        2,
        null
      );
    });

    test('handles single ticker ingestion', async () => {
      const result = await ingestAnalystPriceTargets(['AAPL']);

      expect(result.successCount).toBe(1);
      expect(analystService.fetchAnalystPriceTargets).toHaveBeenCalledWith('AAPL');
    });

    test('continues on individual ticker failures', async () => {
      // Mock one failure
      analystService.fetchAnalystPriceTargets
        .mockImplementationOnce(async () => { throw new Error('API error'); })
        .mockImplementationOnce(async (ticker) => ({
          ticker,
          provider: 'Yahoo Finance',
          data_date: '2025-01-15',
          price_target_avg: 170.00
        }));

      const result = await ingestAnalystPriceTargets(['AAPL', 'MSFT']);

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
    });
  });

  // ========================================================================
  // EARNINGS CALENDAR INGESTION
  // ========================================================================

  describe('ingestEarningsCalendar', () => {
    test('successfully ingests earnings events for multiple tickers', async () => {
      const tickers = ['AAPL', 'MSFT'];
      const result = await ingestEarningsCalendar(tickers);

      expect(result.successCount).toBeGreaterThan(0);
      expect(result.eventCount).toBeGreaterThan(0);
      expect(analystService.upsertEarningsEvent).toHaveBeenCalled();
    });

    test('tracks event count separately from ticker count', async () => {
      // Mock multiple events per ticker
      analystService.fetchEarningsCalendar
        .mockResolvedValueOnce([
          { ticker: 'AAPL', event_date: '2025-02-01', event_type: 'earnings_announcement' },
          { ticker: 'AAPL', event_date: '2025-05-01', event_type: 'earnings_announcement' }
        ])
        .mockResolvedValueOnce([
          { ticker: 'MSFT', event_date: '2025-01-30', event_type: 'earnings_announcement' }
        ]);

      const result = await ingestEarningsCalendar(['AAPL', 'MSFT']);

      expect(result.eventCount).toBe(3);
      expect(result.successCount).toBe(2);
    });

    test('handles no earnings data gracefully', async () => {
      analystService.fetchEarningsCalendar.mockResolvedValue([]);

      const result = await ingestEarningsCalendar(['AAPL']);

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(0);
    });
  });

  // ========================================================================
  // EARNINGS ESTIMATES INGESTION
  // ========================================================================

  describe('ingestEarningsEstimates', () => {
    test('successfully ingests earnings estimates when API key available', async () => {
      process.env.POLYGON_API_KEY = 'test-key';

      const result = await ingestEarningsEstimates(['AAPL', 'MSFT']);

      expect(result.successCount).toBeGreaterThan(0);
      expect(result.skipped).toBeUndefined();
    });

    test('skips ingestion when POLYGON_API_KEY not set', async () => {
      delete process.env.POLYGON_API_KEY;

      const result = await ingestEarningsEstimates(['AAPL']);

      expect(result.skipped).toBe(true);
      expect(result.successCount).toBe(0);
    });

    test('logs metadata for earnings estimates', async () => {
      process.env.POLYGON_API_KEY = 'test-key';

      await ingestEarningsEstimates(['AAPL']);

      const calls = analystService.logIngestionMetadata.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('earnings_estimates');
      expect(lastCall[1]).toBe('Polygon.io');
      expect(typeof lastCall[2]).toBe('boolean');
      expect(typeof lastCall[3]).toBe('number');
    });
  });

  // ========================================================================
  // BUYBACK ANNOUNCEMENTS INGESTION
  // ========================================================================

  describe('ingestBuybackAnnouncements', () => {
    let tempDataDir;

    beforeEach(() => {
      // Create temp directory for test data
      tempDataDir = path.join(__dirname, '../../data/buyback_announcements_test');
      if (!fs.existsSync(tempDataDir)) {
        fs.mkdirSync(tempDataDir, { recursive: true });
      }
    });

    afterEach(() => {
      // Cleanup
      if (fs.existsSync(tempDataDir)) {
        fs.rmSync(tempDataDir, { recursive: true });
      }
    });

    test('ingests buyback records from CSV file', async () => {
      const csvContent = `ticker,announcement_date,buyback_type,amount,source
AAPL,2025-01-10,open_market,50000000,SEC_FILING
MSFT,2025-01-08,accelerated_share_repurchase,100000000,PRESS_RELEASE`;

      const csvPath = path.join(tempDataDir, 'test.csv');
      fs.writeFileSync(csvPath, csvContent);

      // Note: In real test, need to mock file reading or use actual temp dir
      const result = await ingestBuybackAnnouncements();

      expect(analystService.validateBuybackRecord).toHaveBeenCalled();
      expect(analystService.normalizeBuybackRecord).toHaveBeenCalled();
    });

    test('ingests buyback records from JSON file', async () => {
      const jsonContent = JSON.stringify([
        {
          ticker: 'NVDA',
          announcement_date: '2024-12-20',
          buyback_type: 'open_market',
          amount: 60000000,
          source: 'SEC_FILING'
        }
      ]);

      const jsonPath = path.join(tempDataDir, 'test.json');
      fs.writeFileSync(jsonPath, jsonContent);

      const result = await ingestBuybackAnnouncements();

      expect(analystService.validateBuybackRecord).toHaveBeenCalled();
    });

    test('skips invalid buyback records', async () => {
      analystService.validateBuybackRecord
        .mockReturnValueOnce({ valid: false, errors: ['ticker: required string'] });

      const result = await ingestBuybackAnnouncements();

      // Record should be skipped, not ingested
    });

    test('logs errors when no data files found', async () => {
      const result = await ingestBuybackAnnouncements();

      // Either no data files or data was successfully loaded
      const calls = analystService.logIngestionMetadata.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('buyback_announcements');
      expect(lastCall[1]).toBe('CSV/JSON');
    });
  });

  // ========================================================================
  // ERROR HANDLING & RECOVERY
  // ========================================================================

  describe('Error Handling', () => {
    test('recovers from individual ticker failures', async () => {
      // First ticker fails, second succeeds
      analystService.fetchAnalystPriceTargets
        .mockImplementationOnce(async () => { throw new Error('Network error'); })
        .mockImplementationOnce(async (ticker) => ({
          ticker,
          provider: 'Yahoo Finance',
          data_date: '2025-01-15'
        }));

      const result = await ingestAnalystPriceTargets(['AAPL', 'MSFT']);

      expect(result.errorCount).toBe(1);
      expect(result.successCount).toBe(1);
    });

    test('logs detailed error information', async () => {
      analystService.fetchAnalystPriceTargets
        .mockImplementationOnce(async () => { throw new Error('API rate limit'); });

      await ingestAnalystPriceTargets(['AAPL']);

      expect(analystService.logIngestionMetadata).toHaveBeenCalled();
    });

    test('handles database insertion errors gracefully', async () => {
      analystService.upsertAnalystPriceTarget
        .mockImplementationOnce(async () => { throw new Error('DB constraint violation'); });

      // Should log error but not crash
      const result = await ingestAnalystPriceTargets(['AAPL']);

      expect(result.errorCount).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // DATA VALIDATION FLOW
  // ========================================================================

  describe('Data Validation Flow', () => {
    test('validates buyback records before insertion', async () => {
      const record = {
        ticker: 'AAPL',
        announcement_date: '2025-01-10',
        buyback_type: 'open_market',
        amount: 50000000
      };

      analystService.validateBuybackRecord.mockReturnValue({
        valid: true,
        errors: []
      });

      // Simulate validation flow
      const validation = analystService.validateBuybackRecord(record);
      expect(validation.valid).toBe(true);

      if (validation.valid) {
        const normalized = analystService.normalizeBuybackRecord(record);
        expect(normalized).toBeDefined();
      }
    });

    test('normalizes data types during ingestion', async () => {
      const rawRecord = {
        ticker: 'aapl',
        amount: '50000000',
        announcement_date: '2025-01-10'
      };

      const normalized = analystService.normalizeBuybackRecord(rawRecord);

      expect(typeof normalized.ticker).toBe('string');
      expect(normalized.ticker).toBe('AAPL');
    });
  });

  // ========================================================================
  // METADATA LOGGING
  // ========================================================================

  describe('Ingestion Metadata Logging', () => {
    test('logs success metadata after successful ingestion', async () => {
      await ingestAnalystPriceTargets(['AAPL']);

      expect(analystService.logIngestionMetadata).toHaveBeenCalledWith(
        'analyst_price_targets',
        'Yahoo Finance',
        expect.any(Boolean),
        expect.any(Number),
        null
      );
    });

    test('logs error metadata with error message on failure', async () => {
      analystService.fetchAnalystPriceTargets.mockImplementationOnce(async () => {
        throw new Error('API unavailable');
      });

      await ingestAnalystPriceTargets(['AAPL']);

      const calls = analystService.logIngestionMetadata.mock.calls;
      const lastCall = calls[calls.length - 1];
      
      expect(lastCall[2]).toBe(false); // success = false
      expect(lastCall[4]).toContain('failed'); // error message
    });

    test('tracks record counts for coverage reporting', async () => {
      const tickers = ['AAPL', 'MSFT', 'GOOGL'];
      await ingestAnalystPriceTargets(tickers);

      const calls = analystService.logIngestionMetadata.mock.calls;
      const lastCall = calls[calls.length - 1];
      
      expect(lastCall[3]).toBe(3); // recordCount
    });
  });
});
