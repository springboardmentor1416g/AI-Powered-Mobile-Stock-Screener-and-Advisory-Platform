module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/screener/', 'src/services/llm_parser/'],
  forceExit: true,
  detectOpenHandles: false,
  testTimeout: 30000,
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/'],
  // Ensure mocks are set up before any code loads
  resetMocks: false,
  clearMocks: false,
  restoreMocks: false
};
