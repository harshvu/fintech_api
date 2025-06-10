const mongoose = require("mongoose");

const predictedStockSchema = new mongoose.Schema({
  userId: String,
  stockNames: [String],
  aiResponse: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PredictedStock", predictedStockSchema);
