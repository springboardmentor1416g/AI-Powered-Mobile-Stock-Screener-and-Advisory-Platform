const llmParserService = require('./llm_parser.service');

exports.translateNLToDSL = async (req, res, next) => {
  try {
    const { query } = req.body;
    const dsl = await llmParserService.translate(query);
    res.json({ success: true, dsl });
  } catch (err) {
    next(err);
  }
};

exports.runNLQuery = async (req, res, next) => {
  try {
    const { query } = req.body;
    const results = await llmParserService.run(query);
    res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
};
