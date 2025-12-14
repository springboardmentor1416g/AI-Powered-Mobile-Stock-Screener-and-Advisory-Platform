import express from "express";
import healthRoutes from "./routes/health.routes.js";
import metadataRoutes from "./routes/metadata.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import authRoutes from './routes/auth.routes.js';
const app = express();

app.use(express.json());

app.use("/health", healthRoutes);
app.use("/metadata", metadataRoutes);
app.use('/auth', authRoutes);
export default app;

