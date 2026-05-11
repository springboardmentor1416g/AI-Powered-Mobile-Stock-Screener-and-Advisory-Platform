const router = require("express").Router();

router.post("/test", async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Screener query is required",
    });
  }

  // 🔧 Mock screener results (simulate DSL → SQL output)
  const results = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 182.45,
      marketCap: "2.8T",
      peRatio: 29.1,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 412.30,
      marketCap: "3.1T",
      peRatio: 34.8,
    },
  ];

  return res.json({
    success: true,
    query,
    count: results.length,
    results,
  });
});

module.exports = router;