const express = require("express");
const cors = require("cors");

const parseRoutes = require("./routes/parse.routes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/v1/parse", parseRoutes);

app.get("/health", (_, res) => {
  res.json({
    status: "UP",
    service: "llm-parser",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`LLM Parser running on port ${PORT}`);
});
