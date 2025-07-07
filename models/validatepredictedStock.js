// models/validatePredictedStock.js
const mongoose = require("mongoose");

const summaryItemSchema = new mongoose.Schema({
  recordCount: Number,
  averageAccuracy: Number,
  avgPredictedGap: Number,
  avgActualGap: Number,
  openingRangeAccuracyRate: Number,
  supportLevelAccuracyRate: Number,
  resistanceLevelAccuracyRate: Number,
  predicted_range_lower: Number,
  predicted_range_upper: Number,
  actual_opening: Number,
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const validatePredictedStockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  aiResponse: mongoose.Schema.Types.Mixed,
  summary: {
    type: Map,
    of: summaryItemSchema
  }
}, { timestamps: true });

module.exports = mongoose.model("validatePredictedStock", validatePredictedStockSchema);
