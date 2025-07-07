const mongoose = require("mongoose");

// Define the inner summary schema (each stock)
const summaryItemSchema = new mongoose.Schema({
  recordCount: { type: Number, default: 0 },
  averageAccuracy: { type: Number, default: 0 }, // % out of 100
  avgPredictedGap: { type: Number, default: 0 },
  avgActualGap: { type: Number, default: 0 },
  openingRangeAccuracyRate: { type: Number, default: 0 }, // percentage
  supportLevelAccuracyRate: { type: Number, default: 0 },
  resistanceLevelAccuracyRate: { type: Number, default: 0 },
  predicted_range_lower: { type: Number },
  predicted_range_upper: { type: Number },
  actual_opening: { type: Number },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// Define the main schema
const validatepredictedStockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  aiResponse: mongoose.Schema.Types.Mixed,
  summary: { type: Map, of: summaryItemSchema } // ✅ Use Map to store stock keys
}, {
  timestamps: true
});

module.exports = mongoose.model("validatePredictedStock", validatepredictedStockSchema);
