const express = require("express");
const router = express.Router();
const { runScreener } = require("../runner/runner");

router.post("/run", async (req, res) => {
  try {
    const rules = req.body.rules;
    const results = await runnner(rules);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
