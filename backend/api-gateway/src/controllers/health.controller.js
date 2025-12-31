function health(req, res) {
  res.json({
    status: "UP",
    environment: process.env.ENV || "dev",
    timestamp: new Date().toISOString(),
  });
}

module.exports = { health };
