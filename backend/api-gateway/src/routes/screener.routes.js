const express = require("express");
<<<<<<< HEAD
const router = express.Router();

router.post("/run", (req, res) => {
  res.json({
    results: [
      { symbol: "TCS", sector: "IT", pe: 22 },
      { symbol: "INFY", sector: "IT", pe: 18 },
      { symbol: "HDFCBANK", sector: "BANK", pe: 20 }
    ]
  });
=======
const { screenStocks } = require("../../../services/screener_engine/screener.service");


const router = express.Router();

router.post("/run", async (req, res, next) => {
  try {
    const result = await screenStocks(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
});

module.exports = router;
