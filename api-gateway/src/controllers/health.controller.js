export const healthCheck = (req, res) => {
  res.json({
    status: "UP",
    environment: process.env.ENV || "dev",
    timestamp: new Date().toISOString()
  });
};
