import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.ENVIRONMENT || "dev"}`
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT} (${process.env.ENVIRONMENT})`);
});
