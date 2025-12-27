const llmStub = require('../llm_stub');
const validateDSL = require('./llm_parser.validator');
const screenerAdapter = require('../screener.adapter');

/**
 * Translate Natural Language → DSL only
 */
exports.translate = async (nlQuery) => {
  if (!nlQuery || nlQuery.trim() === '') {
    throw new Error('Natural language query is required');
  }

  const dsl = llmStub.translate(nlQuery);

  if (!dsl) {
    throw new Error('LLM could not translate query');
  }

  validateDSL(dsl);
  return dsl;
};

/**
 * Full NL → DSL → Screener execution (via adapter)
 */
exports.run = async (nlQuery) => {
  const dsl = await exports.translate(nlQuery);

  // Execution happens via adapter (mocked for now)
  const results = await screenerAdapter.run(dsl);

  return results;
};
