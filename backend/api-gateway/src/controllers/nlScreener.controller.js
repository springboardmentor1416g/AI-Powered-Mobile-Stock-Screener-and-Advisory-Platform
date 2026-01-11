const { parseNlQuery } = require("../services/llm_parser");
const { validateDsl } = require("../services/dsl_validator");
const { runScreener } = require("../services/screener/runner");

async function runNlScreener(req, res, next) {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ success: false, error: "Invalid query" });
    }

    // 1️⃣ NL → DSL (LLM stub)
    const dsl = await parseNlQuery(query);

    // 2️⃣ DSL validation
    validateDsl(dsl);

    // 3️⃣ Execute screener
    const results = await runScreener({
      pool: req.app.locals.db,
      dsl,
      limit: 50,
    });

    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { runNlScreener };
