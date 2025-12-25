const express = require('express');
const router = express.Router();

const controller = require('./llm_parser.controller');

router.post('/nl', controller.handleNLQuery);

module.exports = router;
