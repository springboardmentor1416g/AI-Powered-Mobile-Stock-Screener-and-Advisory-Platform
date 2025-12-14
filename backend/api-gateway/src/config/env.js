import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.ENV || "dev"}`
});

export default {
  port: process.env.PORT || 8080,
  env: process.env.ENV || "dev"
};
