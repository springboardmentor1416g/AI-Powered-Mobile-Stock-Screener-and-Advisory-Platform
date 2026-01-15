const Alert = require("../models/AlertSubscription");
const Notification = require("../models/Notification");
const screenerRunner = require("./screenerRunner.service");

async function runAlertEngine() {
  const alerts = await Alert.find({ enabled: true });

  for (const alert of alerts) {
    const triggered = await screenerRunner.evaluate(
      alert.stock_id,
      alert.condition
    );

    if (triggered) {
      if (
        alert.last_triggered &&
        Date.now() - alert.last_triggered.getTime() < 24 * 60 * 60 * 1000
      ) continue;

      await Notification.create({
        user_id: alert.user_id,
        stock_id: alert.stock_id,
        alert_id: alert._id,
        message: `Alert triggered for ${alert.stock_id}`
      });

      alert.last_triggered = new Date();
      await alert.save();
    }
  }
}

module.exports = { runAlertEngine };
