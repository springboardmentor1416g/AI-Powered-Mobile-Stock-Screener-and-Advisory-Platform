const { runScreenerLegacy } = require("./legacyRunner");
const { runScreenerWithLLM } = require("./llmRunner");

async function runScreener({ query, pool, limit }) {
  if (process.env.ENABLE_LLM_PARSER === "true") {
    return runScreenerWithLLM({ query, pool, limit });
  }

  return runScreenerLegacy({ query, pool, limit });
}

module.exports = { runScreener };
