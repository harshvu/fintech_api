const mongoose = require("mongoose");

// const predictedStockInSchema = new mongoose.Schema({
//   userId: String,
//   stockNames: [String],
//   aiResponse: Object,
//   createdAt: { type: Date, default: Date.now }
// });
const predictedStockInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stockNames: [String],
  aiResponse: mongoose.Schema.Types.Mixed
}, {
  timestamps: true // 👈 this adds createdAt and updatedAt
});
module.exports = mongoose.model("predictedStockIn", predictedStockInSchema);
