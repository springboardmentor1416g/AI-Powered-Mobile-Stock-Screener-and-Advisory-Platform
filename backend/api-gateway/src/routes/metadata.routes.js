const express = require("express");
const router = express.Router();

router.get("/stocks", (req, res) => {
  res.json([
    { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
    { symbol: "INFY", name: "Infosys Ltd", sector: "IT" },
  ]);
});

module.exports = router;
