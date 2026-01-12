const express = require("express");
const router = express.Router();
const { parseAndValidateQuery } = require("../../services/llm_parser");
const { validateDSL } = require("../../services/validation/validator");

router.post("/run", async (req, res) => {
  try {
    const { query } = req.body;

    // 1. NL → DSL via parser
    const { dsl } = await parseAndValidateQuery(query, {
      request_id: req.traceId
    });

    // 2. Validate extended DSL rules
    const validation = validateDSL(dsl);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: validation.error
      });
    }

    // 3. TEMP: mock execution (real engine already exists in earlier modules)
    return res.json({
      success: true,
      dsl_used: dsl,
      results: [
        { symbol: "TCS", pe_ratio: 8, promoter_holding: 72 },
        { symbol: "INFY", pe_ratio: 12, promoter_holding: 65 }
      ]
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "SCREEN_RUN_FAILED",
      message: err.message
    });
  }
});

module.exports = router;
