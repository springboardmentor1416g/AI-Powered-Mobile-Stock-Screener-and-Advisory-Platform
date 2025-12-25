const llmStub = require('../llm_stub');
const validateDSL = require('./llm_parser.validator');

const compileDSL = require('../../../../screener_engine/compiler/screener_compiler');
const screenerRunner = require('../../../../screener_engine/runner/screener_runner');

exports.processNLQuery = async (nlQuery) => {
  // 1. Call LLM Stub
  const dsl = llmStub.translate(nlQuery);

  if (!dsl) {
    throw new Error('LLM could not translate query');
  }

  // 2. Validate DSL
  validateDSL(dsl);

  // 3. Compile DSL → SQL
  const compiledQuery = compileDSL(dsl);

  // 4. Execute query
  const results = await screenerRunner.run(compiledQuery);

  return results;
};
