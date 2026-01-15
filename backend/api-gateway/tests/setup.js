/**
 * Jest setup file - MUST run before app imports
 * This file is loaded via setupFilesAfterEnv in jest.config.js
 * 
 * CRITICAL: All mocks MUST be set up before any app code runs
 */

// MUST mock dotenv immediately - it's required by screener_runner.js
jest.mock('dotenv', () => ({
  config: jest.fn().mockReturnValue({ error: null })
}));

// Mock node modules that may not be available
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rows: [] }),
    connect: jest.fn().mockResolvedValue({ release: jest.fn() }),
    end: jest.fn().mockResolvedValue(null)
  }))
}));

// Mock all service modules BEFORE app.js imports them
jest.mock('../src/services/fundamentals.service', () => ({
  getFundamentalData: jest.fn().mockResolvedValue([])
}));

jest.mock('../src/services/portfolio.service', () => ({
  createPosition: jest.fn().mockResolvedValue({}),
  getPortfolio: jest.fn().mockResolvedValue([]),
  getPosition: jest.fn().mockResolvedValue(null),
  updatePosition: jest.fn().mockResolvedValue({}),
  removeFromPortfolio: jest.fn().mockResolvedValue({})
}));

jest.mock('../src/services/watchlist.service', () => ({
  createWatchlist: jest.fn().mockResolvedValue({}),
  getUserWatchlists: jest.fn().mockResolvedValue([]),
  getWatchlist: jest.fn().mockResolvedValue(null),
  updateWatchlistName: jest.fn().mockResolvedValue({}),
  deleteWatchlist: jest.fn().mockResolvedValue({}),
  addToWatchlist: jest.fn().mockResolvedValue({}),
  removeFromWatchlist: jest.fn().mockResolvedValue({})
}));

jest.mock('../src/services/alert.service', () => ({
  createAlert: jest.fn().mockResolvedValue({}),
  getUserAlerts: jest.fn().mockResolvedValue([]),
  getAlert: jest.fn().mockResolvedValue(null),
  updateAlert: jest.fn().mockResolvedValue({}),
  deleteAlert: jest.fn().mockResolvedValue({}),
  toggleAlert: jest.fn().mockResolvedValue({})
}));

jest.mock('../src/services/user.service', () => ({
  getUserById: jest.fn().mockResolvedValue(null),
  createUser: jest.fn().mockResolvedValue({})
}));

jest.mock('../src/services/metadata.service', () => ({
  getStocks: jest.fn().mockResolvedValue([])
}));

// Mock external screener modules that require dotenv
jest.mock('../src/services/screener.adapter', () => ({
  run: jest.fn().mockResolvedValue([])
}));

jest.mock('../src/services/screener.enricher', () => ({
  enrichResults: jest.fn().mockReturnValue([])
}));

jest.mock('../src/screener/screener.routes', () => require('express').Router());

jest.mock('../src/services/llm_stub', () => ({
  translateQuery: jest.fn().mockResolvedValue({})
}));

jest.mock('../src/services/llm_parser/llm_parser.service', () => ({
  parseQuery: jest.fn().mockResolvedValue({})
}));

jest.mock('../src/routes/llm.routes', () => require('express').Router());

// Global test timeout
jest.setTimeout(30000);

// Cleanup after all tests
afterAll(async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 500));
});

