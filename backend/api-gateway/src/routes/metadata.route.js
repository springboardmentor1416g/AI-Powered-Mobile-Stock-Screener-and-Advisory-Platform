const router = require("express").Router();
const { getStockMetadata } = require("../services/metadata.service");

router.get("/stocks", async (req, res, next) => {
  try {
    const rows = await getStockMetadata();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

module.exports = router;