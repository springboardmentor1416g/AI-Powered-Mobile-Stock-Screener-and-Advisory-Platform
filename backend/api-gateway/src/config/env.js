const dotenv = require("dotenv");
const path = require("path");

function loadEnv() {
  // ENV can be dev / staging / prod
  const env = process.env.ENV || "dev";
  const envFile = path.join(__dirname, "../../config", `.env.${env}`);

  dotenv.config({ path: envFile });

  // fallback to normal .env if present
  dotenv.config();

  return env;
}

module.exports = { loadEnv };
