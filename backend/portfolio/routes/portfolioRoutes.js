const express = require("express");
const router = express.Router();
const { getPortfolio, addToPortfolio } = require("../controllers/portfolioController");

// GET /api/portfolio?userId=...
router.get("/", getPortfolio);

// POST /api/portfolio/add
router.post("/add", addToPortfolio);

module.exports = router;