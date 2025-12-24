const User = require("../models/user.model");
const UserStockPortfolio = require("../models/stockPortfolio.model");
const UserAllocation = require("../models/userAllocation");
const {
  sendToAIAllocationModel,
  sendBatchToInitializeAI
} = require("../services/aiAllocation");

const allocateBudgetBatch = async (req, res) => {
  try {
    // 1️⃣ Get stocks grouped by user
    const userStockGroups = await UserStockPortfolio.aggregate([
      {
        $group: {
          _id: "$userId",
          stocks: { $addToSet: "$stockName" }
        }
      }
    ]);

    if (!userStockGroups.length) {
      return res.status(400).json({ message: "No user portfolios found" });
    }

    const batchUsersPayload = [];

    // 2️⃣ Loop user-wise
    for (const userGroup of userStockGroups) {
      const userId = userGroup._id;
      const userStocks = userGroup.stocks.map(s => s.toUpperCase());

      // 3️⃣ Get user budget
      const user = await User.findById(userId).select("total_budget");

      if (!user || user.total_budget <= 0) {
        console.warn(`⚠️ Skipping user ${userId} (invalid budget)`);
        continue;
      }

      // 4️⃣ Prepare AI allocation payload
      const aiPayload = {
        ticker: userStocks,
        total_budget: user.total_budget
      };

      // 5️⃣ Call AI allocation
      const aiResponse = await sendToAIAllocationModel(aiPayload);

      if (!aiResponse || !aiResponse.stock_allocations) {
        console.warn(`⚠️ Invalid AI response for user ${userId}`);
        continue;
      }

      // 6️⃣ Save allocation to DB
      const allocationDoc = await UserAllocation.create({
        userId,
        userStocks,
        allocation_date: aiResponse.allocation_date,
        total_budget: aiResponse.total_budget,
        risk_profile: aiResponse.risk_profile,
        allocation_method: aiResponse.allocation_method,
        strategy_level_allocation: aiResponse.strategy_level_allocation,
        stock_allocations: aiResponse.stock_allocations,
        summary: aiResponse.summary
      });

      // 7️⃣ Prepare batch payload
      batchUsersPayload.push({
        user_id: userId.toString(),
        portfolio: {
          allocation_date: allocationDoc.allocation_date,
          total_budget: allocationDoc.total_budget,
          risk_profile: allocationDoc.risk_profile,
          allocation_method: allocationDoc.allocation_method,
          strategy_level_allocation: allocationDoc.strategy_level_allocation,
          stock_allocations: allocationDoc.stock_allocations,
          summary: allocationDoc.summary
        }
      });
    }

    if (!batchUsersPayload.length) {
      return res.status(400).json({
        message: "No valid users processed"
      });
    }

    // 8️⃣ Send batch payload to FINAL AI API
    const batchPayload = {
      users: batchUsersPayload
    };

    const batchResponse = await sendBatchToInitializeAI(batchPayload);

    return res.json({
      message: "✅ Batch allocation completed",
      users_processed: batchUsersPayload.length,
      batch_ai_response: batchResponse
    });

  } catch (error) {
    console.error("❌ Batch Allocation Error:", error);
    return res.status(500).json({
      message: "Batch allocation failed",
      error: error.message
    });
  }
};

module.exports = {
  allocateBudgetBatch
};
