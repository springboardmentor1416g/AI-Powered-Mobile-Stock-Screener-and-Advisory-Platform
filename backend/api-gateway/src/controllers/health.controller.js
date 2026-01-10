// backend/api-gateway/src/controllers/health.controller.js
function health(req, res) {
  res.json({
    status: "UP",
    environment: process.env.ENV || "dev",
    timestamp: new Date().toISOString(),
  });
}
module.exports = { health };
