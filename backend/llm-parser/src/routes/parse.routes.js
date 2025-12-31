const express = require("express");
const router = express.Router();

const { buildScreenerPrompt } = require("../services/prompt.builder");
const { callOllama } = require("../utils/ollama.client");

router.post("/screener", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "QUERY_REQUIRED"
      });
    }

    const prompt = buildScreenerPrompt(query);
    const result = await callOllama(prompt);

    res.json({
      success: true,
      parsed: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "LLM_PARSE_FAILED"
    });
  }
});

module.exports = router;
