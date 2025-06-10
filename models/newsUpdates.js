const mongoose = require("mongoose");

const NewsUpdatesSchema = new mongoose.Schema({
  aiResponse: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("news_updates", NewsUpdatesSchema);
