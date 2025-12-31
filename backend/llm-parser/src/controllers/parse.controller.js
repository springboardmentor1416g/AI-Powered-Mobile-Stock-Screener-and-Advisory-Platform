const { buildPrompt } = require("../services/prompt.builder");
const { callLLM } = require("../services/llm.service");

exports.parseQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({
        success: false,
        error_code: "BAD_REQUEST",
        message: "Query missing"
      });
    }

    const prompt = buildPrompt(query);
    const raw = await callLLM(prompt);

    const json = JSON.parse(raw); // strict by design
    res.json({ success: true, data: json });

  } catch (err) {
    res.status(500).json({
      success: false,
      error_code: "LLM_PARSE_FAILED",
      message: err.message
    });
  }
};
