const express = require("express");
const router = express.Router();

const parseNL = require("../../llm-parser/parser.stub");
const validateDSL = require("../../screener/dslValidator");
const compileDSL = require("../../screener/screenerCompiler");
const runScreener = require("../../screener/screenerRunner");

router.post("/nl", async (req, res) => {
  try {
    const { query, requestId } = req.body;

    const dsl = await parseNL(query);
    validateDSL(dsl);

    const compiled = compileDSL(dsl);
    const results = runScreener(compiled);

    res.json({
      requestId,
      count: results.length,
      results
    });
  } catch (err) {
    res.status(400).json({
      error: "Unable to process query",
      message: err.message
    });
  }
});

module.exports = router;
