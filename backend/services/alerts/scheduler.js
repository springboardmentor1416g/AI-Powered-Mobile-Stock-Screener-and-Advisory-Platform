const cron = require("node-cron");
const { runAlertEngine } = require("./alert_engine");

cron.schedule("0 9 * * *", async () => {
  console.log("Running alert engine...");
  await runAlertEngine();
});
