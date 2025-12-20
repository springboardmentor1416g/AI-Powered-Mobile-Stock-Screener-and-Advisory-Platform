const express = require("express");
const router = express.Router();
const { getStocks } = require("../controllers/metadata.controller");

router.get("/stocks", getStocks);

module.exports = router;
