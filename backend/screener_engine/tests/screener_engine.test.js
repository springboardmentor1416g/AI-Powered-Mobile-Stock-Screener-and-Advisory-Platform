const compile = require('../compiler/screener_compiler');

test('DSL compiles to SQL with params', () => {
  const dsl = {
    filter: {
      and: [
        { field: 'pe_ratio', operator: '<', value: 20 },
        { field: 'revenue', operator: '>', value: 1000 }
      ]
    }
  };

  const query = compile(dsl);

  expect(query.sql).toContain('pe_ratio < $1');
  expect(query.sql).toContain('revenue > $2');
  expect(query.params).toEqual([20, 1000]);
});
