const cron = require("node-cron");
const { runAlertEngine } = require("../services/alertEngine.service");

cron.schedule("0 9 * * *", async () => {
  console.log("Running alert scheduler...");
  await runAlertEngine();
});
