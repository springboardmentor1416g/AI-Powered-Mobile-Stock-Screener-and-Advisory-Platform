const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: String,
  stockId: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);
