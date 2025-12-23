const express = require('express');
const router = express.Router();
const { translateNLToDSL } = require('../services/llm_stub');

router.post('/translate', (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Query cannot be empty'
    });
  }

  try {
    const dsl = translateNLToDSL(query);

    return res.json({
      success: true,
      dsl
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
