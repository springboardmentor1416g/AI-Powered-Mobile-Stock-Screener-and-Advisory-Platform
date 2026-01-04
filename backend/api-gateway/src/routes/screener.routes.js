const express = require("express");
const router = express.Router();

router.post("/run", (req, res) => {
  res.json({
    results: [
      { symbol: "TCS", sector: "IT", pe: 22 },
      { symbol: "INFY", sector: "IT", pe: 18 },
      { symbol: "HDFCBANK", sector: "BANK", pe: 20 }
    ]
  });
});

module.exports = router;
