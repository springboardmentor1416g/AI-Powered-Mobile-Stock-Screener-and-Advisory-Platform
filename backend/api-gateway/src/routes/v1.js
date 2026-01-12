const express = require("express");
const { health } = require("../controllers/health.controller");
const { stocks } = require("../controllers/metadata.controller");

const router = express.Router();

router.get("/health", health);
router.get("/metadata/stocks", stocks);

module.exports = { v1Router: router };
