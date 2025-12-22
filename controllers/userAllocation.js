const User = require("../models/user.model");
const UserStockPortfolio = require("../models/stockPortfolio.model");
const UserAllocation = require("../models/userAllocation");
const { sendToAIAllocationModel } = require("../services/aiAllocation");

const allocateBudget = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Get budget from USERS table
    const user = await User.findById(userId).select("total_budget");

    if (!user || user.total_budget <= 0) {
      return res.status(400).json({
        message: "User budget not configured"
      });
    }

    // 2️⃣ Get user stocks
    const stocks = await UserStockPortfolio.find(
      { userId },
      { stockName: 1, _id: 0 }
    );

    if (!stocks.length) {
      return res.status(400).json({
        message: "User has no stocks"
      });
    }

    // 3️⃣ Prepare AI payload
    const payload = {
      ticker: stocks.map(s => s.stockName.toUpperCase()),
      total_budget: user.total_budget
    };

    // 4️⃣ Call AI
    const aiResponse = await sendToAIAllocationModel(payload);

    if (!aiResponse || !aiResponse.stock_allocations) {
      return res.status(500).json({
        message: "Invalid AI response"
      });
    }

    // 5️⃣ Save allocation (NO Map conversion needed)
    const allocation = await UserAllocation.create({
      userId,
      allocation_date: aiResponse.allocation_date,
      total_budget: aiResponse.total_budget,
      risk_profile: aiResponse.risk_profile,
      allocation_method: aiResponse.allocation_method,
      strategy_level_allocation: aiResponse.strategy_level_allocation,
      stock_allocations: aiResponse.stock_allocations,
      summary: aiResponse.summary
    });

    return res.json({
      message: "✅ Allocation generated & saved",
      data: allocation
    });

  } catch (error) {
    console.error("❌ Allocation Error:", error);
    return res.status(500).json({
      message: "Allocation failed",
      error: error.message
    });
  }
};

module.exports = { allocateBudget };
