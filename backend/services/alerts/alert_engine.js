const pool = require("../../src/utils/db");

async function runAlertEngine() {
  // 1️⃣ Get active alerts
  const { rows: alerts } = await pool.query(
    `SELECT id, user_id, ticker, rule, last_triggered
     FROM alert_subscriptions
     WHERE status = 'active'`
  );

  for (const alert of alerts) {
    const triggered = await evaluateAlert(alert);

    if (triggered) {
      // 2️⃣ Store notification
      await pool.query(
        `INSERT INTO notifications (user_id, alert_id, message)
         VALUES ($1, $2, $3)`,
        [
          alert.user_id,
          alert.id,
          `Alert triggered for ${alert.ticker}`
        ]
      );

      // 3️⃣ Update last_triggered
      await pool.query(
        `UPDATE alert_subscriptions
         SET last_triggered = NOW()
         WHERE id = $1`,
        [alert.id]
      );
    }
  }
}

async function evaluateAlert(alert) {
  const rule = alert.rule;

  // Example rule: { "type": "earnings_within_days", "days": 30 }
  if (rule.type === "earnings_within_days") {
    const { rows } = await pool.query(
      `SELECT earnings_date
       FROM earnings_calendar
       WHERE ticker = $1`,
      [alert.ticker]
    );

    if (rows.length === 0) return false;

    const earningsDate = new Date(rows[0].earnings_date);
    const now = new Date();
    const diffDays = (earningsDate - now) / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= rule.days;
  }

  return false;
}

module.exports = { runAlertEngine };

if (require.main === module) {
  runAlertEngine()
    .then(() => {
      console.log("Alert engine run completed");
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

