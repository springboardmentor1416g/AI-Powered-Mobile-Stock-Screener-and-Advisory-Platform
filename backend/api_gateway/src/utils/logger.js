const fs = require("fs");

exports.logToFile = (message) => {
  fs.appendFileSync("logs/app.log", message + "\n");
};
