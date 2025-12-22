const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserAllocationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    allocation_date: { type: String, required: true },
    total_budget: { type: Number, required: true },

    risk_profile: String,
    allocation_method: String,

    strategy_level_allocation: {
      intraday: {
        budget: Number,
        percentage: Number,
        num_stocks: Number
      },
      swing: {
        budget: Number,
        percentage: Number,
        num_stocks: Number
      },
      long_term: {
        budget: Number,
        percentage: Number,
        num_stocks: Number
      }
    },

    stock_allocations: {
      type: Map,
      of: new Schema(
        {
          amount: Number,
          percentage: Number,
          category: String,
          current_price: Number,
          atr_percent: Number,
          score: Number,
          approximate_shares: Number
        },
        { _id: false }
      )
    },

    summary: {
      total_allocated: Number,
      cash_remaining: Number,
      num_positions: Number,
      largest_position: Number,
      smallest_position: Number,
      average_position: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAllocation", UserAllocationSchema);
