const compileDSL = require('../../../screener_engine/compiler/screener_compiler');
const screenerRunner = require('../../../screener_engine/runner/screener_runner');

/**
 * Adapter: DSL → SQL → Execution
 * LLM layer NEVER talks directly to compiler or DB
 */
async function run(dsl) {
  // Compile DSL → SQL
  const compiledQuery = compileDSL(dsl);

  // Execute SQL safely
  const results = await screenerRunner.run(compiledQuery);

  return results;
}

module.exports = {
  run
};
