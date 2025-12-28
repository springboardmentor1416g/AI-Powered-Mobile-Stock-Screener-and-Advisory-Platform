const { callLLM } = require("../../services/llm_parser/llmClient");
const { buildPrompt } = require("../utils/promptBuilder");
const { validateDSL } = require("../utils/dslValidator");
const { compileScreener } = require("../../screener/compiler/compiler");
const { runScreener } = require("../../screener/runner/runner");

async function parseAndRun(req, res) {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    // 1. Get DSL from LLM
    const prompt = buildPrompt(query);
    const llmOutput = await callLLM(prompt);
    
    let dsl;
    try {
      dsl = JSON.parse(llmOutput);
    } catch {
      throw new Error("LLM returned invalid JSON");
    }

    validateDSL(dsl);

    // 2. Compile to SQL
    const compiled = compileScreener(dsl);

    // 🔴 FIX: ADD 'await' HERE
    const results = await runScreener(compiled); 

    res.json({ success: true, query, dsl, results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { parseAndRun };