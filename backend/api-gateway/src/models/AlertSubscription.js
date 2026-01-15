const mongoose = require("mongoose");

const AlertSubscriptionSchema = new mongoose.Schema({
  user_id: String,
  stock_id: String,
  condition: Object,   // DSL JSON
  frequency: { type: String, default: "daily" },
  enabled: { type: Boolean, default: true },
  last_triggered: Date
});

module.exports = mongoose.model("AlertSubscription", AlertSubscriptionSchema);
