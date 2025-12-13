import express from "express";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.js";
import metadataRoutes from "./routes/metadata.js";
import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config({ path: `.env.${process.env.ENVIRONMENT || "dev"}` });

const app = express();
app.use(express.json());
app.use(requestLogger);

// API versioning
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/metadata", metadataRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
