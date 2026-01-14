const compileDSL = require('../../../screener_engine/compiler/screener_compiler');
const screenerRunner = require('../../../screener_engine/runner/screener_runner');
const { enrichResults } = require('./screener.enricher');

async function run(dsl) {
  const compiledQuery = compileDSL(dsl);
  const rawResults = await screenerRunner.run(compiledQuery);

  // SAFE enrichment
  return enrichResults(rawResults, dsl);
}

module.exports = { run };
