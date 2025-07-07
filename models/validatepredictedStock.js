const mongoose = require("mongoose");

// Schema for each stock summary
const summaryItemSchema = new mongoose.Schema({
  recordCount: { type: Number, default: 0 },
  averageAccuracy: { type: Number, default: 0 }, // percentage (0-100)
  avgPredictedGap: { type: Number, default: 0 },
  avgActualGap: { type: Number, default: 0 },
  openingRangeAccuracyRate: { type: Number, default: 0 }, // 1 or 0
  supportLevelAccuracyRate: { type: Number, default: 0 },
  resistanceLevelAccuracyRate: { type: Number, default: 0 },
  predicted_range_lower: { type: Number, default: 0 },
  predicted_range_upper: { type: Number, default: 0 },
  actual_opening: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false }); // prevent _id creation in sub-doc

// Main schema
const validatePredictedStockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // format: YYYY-MM-DD
  aiResponse: mongoose.Schema.Types.Mixed,
  summary: {
    type: Map,
    of: summaryItemSchema,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("validatePredictedStock", validatePredictedStockSchema);
