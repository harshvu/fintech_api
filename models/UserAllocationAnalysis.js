const mongoose = require("mongoose");
const { Schema } = mongoose;

const AISignalSchema = new Schema(
  {
    symbol: String,
    action: String,
    position_type: String,
    category: String,
    confidence: Number,
    reasoning: String,
    quantity: Number,
    entry_price: Number,
    stop_loss: Number,
    profit_target: Number,
    timestamp: String,
    approved: Boolean,
    rejection_reason: String
  },
  { _id: false }
);

const UserAIAnalysisSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    ai_status: String,
    market_status: String,
    workflow_status: String,

    ai_signals: [AISignalSchema],

    actions: { type: Array, default: [] },
    current_positions: { type: Array, default: [] },
    trade_history: { type: Array, default: [] },

    portfolio_summary: {
      total_value: Number,
      cash_balance: Number,
      invested_amount: Number,
      total_pnl: Number,
      pnl_percent: Number,
      open_positions: Number,
      actions_taken: Number,
      win_count: Number,
      loss_count: Number,
      win_rate: Number
    },

    messages: { type: Array, default: [] },

    last_ai_timestamp: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAllocationAnalysis", UserAIAnalysisSchema);
