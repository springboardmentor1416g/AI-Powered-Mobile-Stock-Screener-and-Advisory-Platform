const express = require("express");
const router = express.Router();
const { parseAndValidateQuery } = require("../services/llm_parser");

router.post("/parse", async (req, res) => {
  try {
    const { query } = req.body;

    const result = await parseAndValidateQuery(query, {
      request_id: req.traceId
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "LLM_PARSER_FAILED",
      message: err.message
    });
  }
});

module.exports = router;
