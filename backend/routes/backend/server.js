const express = require("express");
const cors = require("cors");

const screenerRoutes = require("./routes/screener");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/screener", screenerRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
