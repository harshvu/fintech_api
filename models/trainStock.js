const mongoose = require("mongoose");

const trainStockSchema = new mongoose.Schema({
  stock_names: String, // comma-separated string
  ai_response: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TrainStock", trainStockSchema);
