const express = require("express");
const router = express.Router();
const { getStocksMetadata } = require("../controllers/metadata.controller");

router.get("/stocks", getStocksMetadata);

module.exports = router;
