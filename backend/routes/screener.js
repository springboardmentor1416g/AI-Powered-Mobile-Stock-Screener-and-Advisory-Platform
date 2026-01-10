const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { query } = req.body;

  console.log("Received screener query:", query);

  // Mock screener results
  const results = [
    {
      symbol: "TCS",
      price: 3450,
      volume: 1200000,
    },
    {
      symbol: "INFY",
      price: 1520,
      volume: 980000,
    },
  ];

  res.json({
    success: true,
    results,
  });
});

module.exports = router;
