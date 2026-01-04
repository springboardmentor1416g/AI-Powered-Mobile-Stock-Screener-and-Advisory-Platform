exports.healthCheck = (req, res) => {
  res.json({
    status: "UP",
    environment: process.env.ENV,
    timestamp: new Date().toISOString()
  });
};
