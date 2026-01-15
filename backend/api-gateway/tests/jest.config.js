module.exports = {
  testEnvironment: 'node',
  automock: false,
  moduleNameMapper: {
    '^pg$': '<rootDir>/tests/__mocks__/pg.js'
  }
};