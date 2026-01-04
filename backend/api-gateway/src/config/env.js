const path = require("path");
require("dotenv").config({
  path: `.env.${process.env.ENV || "dev"}`
});
