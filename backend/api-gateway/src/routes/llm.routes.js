const express = require("express");
const router = express.Router();
const { translateNLToDSL } = require("../services/llm_stub/translate");

router.post("/translate", (req, res) => {
  try {
    const { query } = req.body;

    const result = translateNLToDSL(query);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: "NL_TO_DSL_FAILED",
      message: err.message
    });
  }
});

module.exports = router;
