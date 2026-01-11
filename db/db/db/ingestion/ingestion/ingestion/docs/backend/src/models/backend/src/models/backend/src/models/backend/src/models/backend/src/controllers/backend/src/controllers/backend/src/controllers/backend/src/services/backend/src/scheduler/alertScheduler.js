const cron = require("node-cron");
const { runAlerts } = require("../services/alertEngine.service");

cron.schedule("0 9 * * *", () => {
  runAlerts();
});
