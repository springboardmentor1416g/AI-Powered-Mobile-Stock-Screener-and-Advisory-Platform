/**
 * LLM Parser Validation
 * Lightweight sanity checks ONLY
 * Full validation happens in screener_engine
 */

function validateDSL(dsl) {
  if (!dsl || typeof dsl !== 'object') {
    throw new Error('Invalid DSL: must be an object');
  }

  // Prevent unsafe keys
  const forbiddenKeys = ['sql', 'query', 'raw', '$where'];

  for (const key of forbiddenKeys) {
    if (key in dsl) {
      throw new Error(`Unsafe DSL content detected: ${key}`);
    }
  }

  // Do NOT enforce AND/OR here
  return true;
}

module.exports = validateDSL;
