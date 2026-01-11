const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
  userId: String,
  stockId: String,
  condition: Object,
  enabled: Boolean,
  lastTriggered: Date
});

module.exports = mongoose.model("Alert", AlertSchema);
