const mongoose = require("mongoose");

// Summary per stock
const summarySchema = new mongoose.Schema({
  stock: { type: String, required: true },
  recordCount: { type: Number, default: 0 },
  averageAccuracy: { type: Number, default: 0 }, // out of 100
  avgPredictedGap: { type: Number, default: 0 },
  avgActualGap: { type: Number, default: 0 },
  openingRangeAccuracyRate: { type: Number, default: 0 }, // percentage
  supportLevelAccuracyRate: { type: Number, default: 0 },
  resistanceLevelAccuracyRate: { type: Number, default: 0 },

  // These three fields are required by your controller
  predicted_range_lower: { type: Number, default: 0 },
  predicted_range_upper: { type: Number, default: 0 },
  actual_opening: { type: Number, default: 0 },

  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// Main schema
const validatepredictedStockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  aiResponse: mongoose.Schema.Types.Mixed, // full raw response keyed by stock
  summary: [summarySchema] // array of summaries
}, {
  timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model("validatePredictedStock", validatepredictedStockSchema);
