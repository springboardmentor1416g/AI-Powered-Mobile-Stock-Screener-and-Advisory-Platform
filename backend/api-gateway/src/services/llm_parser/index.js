const { translateNLToDSL } = require("../llm_stub/translate");

/**
 * LLM-Parser Service
 * Responsible ONLY for:
 * NL → DSL → Validation
 */
async function parseAndValidateQuery(nlQuery, context = {}) {
  // 1. Log & sanitize
  const query = nlQuery.trim();

  // 2. Call LLM (stub for now)
  const { dsl } = translateNLToDSL(query);

  // 3. Validate DSL structure
  if (!dsl || !dsl.conditions || !dsl.logic) {
    throw new Error("Invalid DSL generated");
  }

  return {
    dsl,
    meta: {
      request_id: context.request_id || null,
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = { parseAndValidateQuery };
