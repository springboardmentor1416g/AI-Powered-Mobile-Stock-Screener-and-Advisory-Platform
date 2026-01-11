const { translateNLToDSL } = require("./index");

exports.handleNLQuery = (req, res) => {
  const { query } = req.body;

  const result = translateNLToDSL(query);

  if (result.error) {
    return res.status(400).json(result);
  }

  // Pass DSL forward to validator / compiler
  res.json(result);
};
