const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user_id: String,
  stock_id: String,
  message: String,
  triggered_at: { type: Date, default: Date.now },
  alert_id: String
});

module.exports = mongoose.model("Notification", NotificationSchema);
