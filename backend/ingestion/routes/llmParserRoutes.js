const express = require("express");
const { parseAndRun } = require("../controllers/llmParserController");

const router = express.Router();

router.post("/parse", parseAndRun);

module.exports = router;