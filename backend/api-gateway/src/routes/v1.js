const express = require("express");
const { health } = require("../controllers/healthController");
const { stocks } = require("../controllers/metadataController");

const router = express.Router();

router.get("/health", health);
router.get("/metadata/stocks", stocks);

module.exports = { v1Router: router };
