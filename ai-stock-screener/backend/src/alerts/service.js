const pool = require("../db/client");
const { runScreener } = require("../screener/engine");

async function evaluateAlerts() {
  const { rows: alerts } = await pool.query(
    "SELECT * FROM alerts WHERE active = true"
  );

  for (const alert of alerts) {
    const results = await runScreener(alert.dsl);

    if (results.length > 0) {
      console.log("🚨 ALERT TRIGGERED:", alert.name);
      console.log("Matching stocks:", results.map(r => r.symbol));
    }
  }
}

module.exports = { evaluateAlerts };
