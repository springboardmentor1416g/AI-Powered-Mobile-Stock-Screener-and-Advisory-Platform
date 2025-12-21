const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

const healthRoutes = require("./routes/health.routes");
const metadataRoutes = require("./routes/metadata.routes");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

dotenv.config({ path: `.env.${process.env.ENV || "dev"}` });

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(requestLogger);

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/metadata", metadataRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
