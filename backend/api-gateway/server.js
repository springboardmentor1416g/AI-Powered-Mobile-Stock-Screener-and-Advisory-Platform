const express = require("express");
const dotenv = require("dotenv");

dotenv.config({ path: `src/config/.env.${process.env.ENV || "dev"}` });

const app = express();
app.use(express.json());

const healthRoutes = require("./src/routes/health.routes");
const metadataRoutes = require("./src/routes/metadata.routes");

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/metadata", metadataRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

const logger = require("./src/middleware/logger");
app.use(logger);

const errorHandler = require("./src/middleware/errorHandler");
app.use(errorHandler);

const authRoutes = require("./src/routes/auth.routes");
const watchlistRoutes = require("./src/routes/watchlist.routes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);

const screenerRoutes = require("./src/routes/screener.routes");
app.use("/api/v1/screener", screenerRoutes);



