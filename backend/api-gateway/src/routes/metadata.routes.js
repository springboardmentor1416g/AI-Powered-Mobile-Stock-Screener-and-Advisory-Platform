const express = require("express");
const router = express.Router();
const { listStocks } = require("../controllers/metadata.controller");

router.get("/metadata/stocks", listStocks);

module.exports = router;
