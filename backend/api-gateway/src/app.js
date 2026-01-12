require("dotenv").config({ path: `.env.${process.env.ENV || "dev"}` });
require("../services/alerts/scheduler");

const express = require("express");
const app = express();

const morgan = require("morgan");
const crypto = require("crypto");

app.use(express.json());
app.use(morgan("dev"));

// Trace ID middleware
app.use((req, res, next) => {
  req.traceId = crypto.randomUUID();
  next();
});

// Routes
const authMiddleware = require("./middleware/auth.middleware");

const healthRoutes = require("./routes/health.routes");
const metadataRoutes = require("./routes/metadata.routes");

const screenerRoutes = require("./routes/screener/run");
app.use("/screener", screenerRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/metadata", metadataRoutes);

const notificationsRoutes = require("./routes/notifications");
app.use("/api/v1/notifications", authMiddleware, notificationsRoutes);

const llmRoutes = require("./routes/llm.routes");
app.use("/llm", llmRoutes);

const llmParserRoutes = require("./routes/llm_parser.routes");
app.use("/llm-parser", llmParserRoutes);

const portfolioRoutes = require("./routes/portfolio");
app.use("/api/v1/portfolio", authMiddleware, portfolioRoutes);

const watchlistRoutes = require("./routes/watchlist");
app.use("/api/v1/watchlist", authMiddleware, watchlistRoutes);

const alertRoutes = require("./routes/alerts");
app.use("/api/v1/alerts", authMiddleware, alertRoutes);

const signupRoute = require("./routes/auth/signup");
const loginRoute = require("./routes/auth/login");

app.use("/auth", signupRoute);
app.use("/auth", loginRoute);

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
    error_code: "INTERNAL_ERROR",
    trace_id: req.traceId,
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

// Example protected route
app.get("/api/v1/protected", authMiddleware, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});


