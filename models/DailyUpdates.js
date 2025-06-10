const mongoose = require("mongoose");

const DailyUpdatesSchema = new mongoose.Schema({
  aiResponse: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("daily_updates", DailyUpdatesSchema);
