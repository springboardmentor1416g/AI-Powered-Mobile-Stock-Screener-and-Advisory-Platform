const express = require("express");
const { health } = require("../controllers/healthcontroller");
const { stocks } = require("../controllers/metadataController");
const watchlistRoutes = require("./watchlist.route");
const portfolioRoutes = require("./portfolio.route");
const nlScreenerRoutes = require("./NLScreener.route");

const router = express.Router();

router.get("/health", health);
router.get("/metadata/stocks", stocks);
router.use("/watchlist", watchlistRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/nl-screener", nlScreenerRoutes);

module.exports = router;