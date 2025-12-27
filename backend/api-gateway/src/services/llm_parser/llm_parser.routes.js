const express = require('express');
const router = express.Router();

const {
  translateNLToDSL,
  runNLQuery
} = require('./llm_parser.controller');

router.post('/translate', translateNLToDSL);
router.post('/run', runNLQuery); 

module.exports = router;
