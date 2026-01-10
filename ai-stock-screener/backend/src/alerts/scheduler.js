const cron = require("node-cron");
const { evaluateAlerts } = require("./service");

function startAlertScheduler() {
  cron.schedule("*/1 * * * *", async () => {
    console.log("⏱ Running alert evaluation...");
    await evaluateAlerts();
  });
}

module.exports = { startAlertScheduler };
