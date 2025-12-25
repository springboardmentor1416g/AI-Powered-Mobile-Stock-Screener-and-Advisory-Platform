const llmParserService = require('./llm_parser.service');

exports.handleNLQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Natural language query is required'
      });
    }

    const results = await llmParserService.processNLQuery(query);

    return res.json({
      success: true,
      results
    });
  } catch (err) {
    console.error('LLM Parser Error:', err.message);

    return res.status(422).json({
      success: false,
      message: err.message
    });
  }
};
