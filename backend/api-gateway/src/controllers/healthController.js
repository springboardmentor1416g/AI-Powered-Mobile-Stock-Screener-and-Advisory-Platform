export const health = (req, res) => {
  res.json({
    status: "OK",
    environment: process.env.ENVIRONMENT,
    timestamp: new Date().toISOString()
  });
};
