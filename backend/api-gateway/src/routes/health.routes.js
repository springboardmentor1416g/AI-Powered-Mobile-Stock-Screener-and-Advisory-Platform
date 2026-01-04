const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { healthCheck } = require("../controllers/health.controller");

router.get("/", healthCheck);
=======

router.get("/", (req, res) => {
  res.json({
    status: "UP",
    environment: process.env.ENV || "dev",
    timestamp: new Date().toISOString()
  });
});
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37

module.exports = router;
