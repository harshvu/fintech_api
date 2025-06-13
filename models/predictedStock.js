const mongoose = require("mongoose");

const predictedStockSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stockNames: [String],
  aiResponse: mongoose.Schema.Types.Mixed
}, {
  timestamps: true // 👈 this adds createdAt and updatedAt
});

module.exports = mongoose.model("PredictedStock", predictedStockSchema);
