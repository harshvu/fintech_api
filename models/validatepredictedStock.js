const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema({
  stock: { type: String, required: true },
  recordCount: { type: Number, default: 0 },
  averageAccuracy: { type: Number, default: 0 }, // out of 100
  avgPredictedGap: { type: Number, default: 0 },
  avgActualGap: { type: Number, default: 0 },
  openingRangeAccuracyRate: { type: Number, default: 0 }, // percentage
  supportLevelAccuracyRate: { type: Number, default: 0 },
  resistanceLevelAccuracyRate: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const validatepredictedStockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // format: YYYY-MM-DD
  aiResponse: mongoose.Schema.Types.Mixed,
  summary: [summarySchema]
}, {
  timestamps: true // adds createdAt and updatedAt fields
});

module.exports = mongoose.model("validatePredictedStockpre", validatepredictedStockSchema);
