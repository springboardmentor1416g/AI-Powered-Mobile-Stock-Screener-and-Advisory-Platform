export const healthCheck = (req, res) => {
  return res.json({
    status: "UP",
    environment: process.env.ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
};
