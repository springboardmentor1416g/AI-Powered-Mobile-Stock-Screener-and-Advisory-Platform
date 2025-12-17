require('dotenv').config();

const screenerCompiler = require('./compiler/screener_compiler');
const { run } = require('./runner/screener_runner');

// Sample DSL
const dsl = {
  filter: {
    and: [
      { field: 'pe_ratio', operator: '<', value: 20 },
      { field: 'revenue_growth_yoy', operator: '>', value: 10 }
    ]
  }
};

(async () => {
  try {
    console.log('Compiling DSL...');
    const query = screenerCompiler(dsl);

    console.log('Generated Query:');
    console.log(query);

    console.log('\nRunning Screener...');
    const results = await run(query);

    console.log('\nResults:');
    console.table(results);
  } catch (err) {
    console.error('Screener Engine Error:', err.message);
  }
})();
