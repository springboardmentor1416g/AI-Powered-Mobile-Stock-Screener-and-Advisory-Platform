exports.healthCheck = (req, res) => {
  res.status(200).json({
    status: 'UP',
    environment: process.env.ENV || 'dev',
    timestamp: new Date().toISOString()
  });
};
