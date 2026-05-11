const health = (req, res) => {
  const healthStatus = {
    status: 'UP',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    uptime: process.uptime(),
  };

  res.status(200).json({
    success: true,
    data: healthStatus,
  });
};

module.exports = {
  health,
};