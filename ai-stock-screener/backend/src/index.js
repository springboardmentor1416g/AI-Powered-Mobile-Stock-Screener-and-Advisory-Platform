require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { startAlertScheduler } = require("./alerts/scheduler");



const { parseNaturalLanguage } = require("./llm/parser");
const { runScreener } = require("./screener/engine");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/screen", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query required" });
    }

    const dsl = await parseNaturalLanguage(query);
    const results = await runScreener(dsl);


    res.json({ dsl, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("API Gateway running on port 5000");
});

startAlertScheduler();
