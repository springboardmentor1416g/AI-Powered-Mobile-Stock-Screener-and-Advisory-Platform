const { translateNLToDSL } = require('../services/llm_parser');
const { runScreener } = require('../services/screener/runner');

const runNlScreener = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query is required' });
  }

  try {
    // Translate NL to DSL
    const dsl = await translateNLToDSL(query);

    // Run screener with DSL filter
    const results = await runScreener({ dsl, limit: 50 });

    res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to run screener. Try queries like "PE ratio below 20" or "Tech stocks with positive earnings growth"'
    });
  }
};

module.exports = { runNlScreener };