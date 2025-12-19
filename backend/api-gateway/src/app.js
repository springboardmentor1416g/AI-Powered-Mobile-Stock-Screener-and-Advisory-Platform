const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const healthRoutes = require("./routes/health.routes");
const metadataRoutes = require("./routes/metadata.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");
const profileRoutes = require("./routes/profile.routes");
const watchlistRoutes = require("./routes/watchlist.routes");
const screenerRoutes = require("./routes/screener.routes");




const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/metadata", metadataRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);
app.use("/api/v1/screener", screenerRoutes);




app.use(errorHandler);

module.exports = app;
