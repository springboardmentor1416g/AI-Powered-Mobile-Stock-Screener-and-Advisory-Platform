const Alert = require("../models/Alert");
const Notification = require("../models/Notification");

module.exports.runAlerts = async () => {
  const alerts = await Alert.find({ enabled: true });

  for (const alert of alerts) {
    const triggered = Math.random() > 0.7; // mock logic

    if (triggered) {
      await Notification.create({
        userId: alert.userId,
        stockId: alert.stockId,
        message: "Alert condition met"
      });

      alert.lastTriggered = new Date();
      await alert.save();
    }
  }
};
