const mongoose = require("mongoose");

// Helper to get current time in Asia/Kolkata
function getIndiaTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

const predictedStockInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stockNames: [String],
  aiResponse: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: getIndiaTime },
  updatedAt: { type: Date, default: getIndiaTime }
});

// Update `updatedAt` on each save to IST time
predictedStockInSchema.pre('save', function (next) {
  this.updatedAt = getIndiaTime();
  next();
});

module.exports = mongoose.model("predictedStockIn", predictedStockInSchema);
