jest.mock('pg', () => {
  const mPool = {
    query: jest.fn()
  };
  return {
    Pool: jest.fn(() => mPool)
  };
});

const { Pool } = require('pg');
const runner = require('../runner/screener_runner');
const fixtures = require('./fixtures/sample_data');

describe('Screener Runner', () => {
  let poolInstance;

  beforeEach(() => {
    poolInstance = new Pool();
  });

  test('returns only matching stocks', async () => {
    // Use fixture data
    poolInstance.query.mockResolvedValueOnce({
      rows: fixtures.matchingLowPE
    });

    const fakeQuery = {
      sql: 'SELECT symbol, name FROM stocks WHERE pe_ratio < $1',
      params: [20]
    };

    const results = await runner.run(fakeQuery);

    expect(poolInstance.query).toHaveBeenCalledWith(
      fakeQuery.sql,
      fakeQuery.params
    );

    expect(results).toEqual(fixtures.matchingLowPE);
  });

  test('handles empty result set', async () => {
    poolInstance.query.mockResolvedValueOnce({ rows: [] });

    const results = await runner.run({
      sql: 'SELECT symbol, name FROM stocks WHERE pe_ratio < $1',
      params: [5]
    });

    expect(results).toEqual([]);
  });
});
