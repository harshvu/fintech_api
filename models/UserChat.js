const mongoose = require("mongoose");

const userChatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  chatId: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  core_conclusion: { type: String },
  source_used: { type: String},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserChat", userChatSchema);
