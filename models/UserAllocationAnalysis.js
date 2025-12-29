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
      total_value: { type: Number, default: 0 },
      cash_balance: { type: Number, default: 0 },
      invested_amount: { type: Number, default: 0 },
      total_pnl: { type: Number, default: 0 },
      pnl_percent: { type: Number, default: 0 },
      open_positions: { type: Number, default: 0 },
      actions_taken: { type: Number, default: 0 },
      win_count: { type: Number, default: 0 },
      loss_count: { type: Number, default: 0 },
      win_rate: { type: Number, default: 0 },

      // ✅ NEW FIELDS
      allocated_budget: { type: Number, default: 0 },
      available_to_trade: { type: Number, default: 0 },

      // ✅ Dynamic per-stock allocation
      stock_budget_allocations: {
        type: Object,
        default: {}
      },
      invested_amount_per_stock: {
        type: Object,
        default: {}
      }
    },

    messages: { type: Array, default: [] },

    last_ai_timestamp: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAllocationAnalysis", UserAIAnalysisSchema);
