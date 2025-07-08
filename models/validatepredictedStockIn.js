// models/validatePredictedStock.js
const mongoose = require("mongoose");

const summaryItemSchema = new mongoose.Schema({
  recordCount: { type: Number, default: 0 },
  averageAccuracy: { type: Number, default: 0 },
  avgPredictedGap: { type: Number, default: 0 },
  avgActualGap: { type: Number, default: 0 },
  openingRangeAccuracyRate: { type: Number, default: 0 },
  supportLevelAccuracyRate: { type: Number, default: 0 },
  resistanceLevelAccuracyRate: { type: Number, default: 0 },
  predicted_range_lower: Number,
  predicted_range_upper: Number,
  actual_opening: Number,
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const validatePredictedStockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  aiResponse: mongoose.Schema.Types.Mixed,
  summary: { type: mongoose.Schema.Types.Mixed } // ✅ changed from Map to Mixed
}, {
  timestamps: true
});

module.exports = mongoose.model("validatePredictedStockIn", validatePredictedStockSchema);
