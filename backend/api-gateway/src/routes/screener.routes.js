const express = require("express");
const { screenStocks } = require("../../../services/screener_engine/screener.service");


const router = express.Router();

router.post("/run", async (req, res, next) => {
  try {
    const result = await screenStocks(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
