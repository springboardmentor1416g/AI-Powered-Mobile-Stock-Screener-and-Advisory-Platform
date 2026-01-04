const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { getStocksMetadata } = require("../controllers/metadata.controller");

router.get("/stocks", getStocksMetadata);
=======

router.get("/stocks", (req, res) => {
  res.json([
    { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
    { symbol: "INFY", name: "Infosys Ltd", sector: "IT" },
    { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy" }
  ]);
});
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37

module.exports = router;
