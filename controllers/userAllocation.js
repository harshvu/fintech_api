const User = require("../models/user.model");
const UserStockPortfolio = require("../models/stockPortfolio.model");
const UserAllocation = require("../models/userAllocation");
const UserAIAnalysis = require("../models/UserAllocationAnalysis");
const {
  sendToAIAllocationModel,
  sendBatchToInitializeAI,
  callBatchAnalyzeAI 
} = require("../services/aiAllocation");

const allocateBudgetBatch = async (req, res) => {
  try {
    // 1️⃣ Group stocks user-wise from portfolio
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

    // 2️⃣ Loop per user
    for (const userGroup of userStockGroups) {
      const userId = userGroup._id;
      const userStocks = userGroup.stocks.map(s => s.toUpperCase()).sort();

      // 3️⃣ Fetch user budget
      const user = await User.findById(userId).select("total_budget");

      if (!user || user.total_budget <= 0) {
        console.warn(`⚠️ Skipping user ${userId} (invalid budget)`);
        continue;
      }

      // 4️⃣ Fetch last allocation (if exists)
      const existingAllocation = await UserAllocation.findOne({ userId })
        .sort({ createdAt: -1 })
        .select("userStocks");

      // 5️⃣ Compare stocks (skip AI if no change)
      if (existingAllocation?.userStocks?.length) {
        const prevStocks = [...existingAllocation.userStocks].sort();

        const isSameStocks =
          prevStocks.length === userStocks.length &&
          prevStocks.every((s, i) => s === userStocks[i]);

        if (isSameStocks) {
          console.log(`⏭️ Skipping AI call for user ${userId} (stocks unchanged)`);
          continue;
        }
      }

      // 6️⃣ Prepare AI payload
      const aiPayload = {
        ticker: userStocks,
        total_budget: user.total_budget
      };

      // 7️⃣ Call AI allocation
      const aiResponse = await sendToAIAllocationModel(aiPayload);

      if (!aiResponse || !aiResponse.stock_allocations) {
        console.warn(`⚠️ Invalid AI response for user ${userId}`);
        continue;
      }

      const allocationData = {
        userId,
        userStocks,
        allocation_date: aiResponse.allocation_date,
        total_budget: aiResponse.total_budget,
        risk_profile: aiResponse.risk_profile,
        allocation_method: aiResponse.allocation_method,
        strategy_level_allocation: aiResponse.strategy_level_allocation,
        stock_allocations: aiResponse.stock_allocations,
        summary: aiResponse.summary
      };

      // 8️⃣ UPDATE if exists else CREATE
      const allocationDoc = existingAllocation
        ? await UserAllocation.findOneAndUpdate(
            { userId },
            { $set: allocationData },
            { new: true }
          )
        : await UserAllocation.create(allocationData);

      // 9️⃣ Prepare batch payload
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
        message: "No valid users processed (no stock changes detected)"
      });
    }

    // 🔟 Send batch payload to FINAL AI API
    const batchPayload = {
      users: batchUsersPayload
    };

    const batchResponse = await sendBatchToInitializeAI(batchPayload);

    return res.json({
      message: "✅ Batch allocation completed",
      batchPayload:batchPayload,
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
const runUserAIAnalysisBatch = async (req, res) => {
  try {
    // 1️⃣ Get DISTINCT userIds from UserAllocation
    const userIds = await UserAllocation.distinct("userId");

    if (!userIds.length) {
      return res.status(400).json({
        message: "No users found in allocation table"
      });
    }

    // Convert ObjectIds → strings (AI expects strings)
    const userIdStrings = userIds.map(id => id.toString());

    // 2️⃣ Call AI batch analyze API
    const aiBatchResponse = await callBatchAnalyzeAI(userIdStrings);

    if (!aiBatchResponse?.results?.length) {
      return res.status(400).json({
        message: "Invalid AI response"
      });
    }

    let processed = 0;

    // 3️⃣ Save AI result user-wise (UPSERT)
    for (const item of aiBatchResponse.results) {
      if (item.status !== "success" || !item.result) continue;

      const userId = item.user_id;
      const result = item.result;

      const payload = {
        userId,
        ai_status: result.status,
        market_status: result.market_status,
        workflow_status: result.workflow_status,
        ai_signals: result.ai_signals || [],
        actions: result.actions || [],
        current_positions: result.current_positions || [],
        trade_history: result.trade_history || [],
        portfolio_summary: result.portfolio_summary || {},
        messages: result.messages || [],
        last_ai_timestamp: result.timestamp
      };

      await UserAIAnalysis.findOneAndUpdate(
        { userId },
        { $set: payload },
        { upsert: true, new: true }
      );

      processed++;
    }

    return res.json({
      message: "✅ AI batch analysis completed",
      total_users: userIdStrings.length,
      success_count: processed,
      failure_count: aiBatchResponse.failure_count || 0
    });

  } catch (error) {
    console.error("❌ AI Analysis Batch Error:", error);
    return res.status(500).json({
      message: "AI batch analysis failed",
      error: error.message
    });
  }
};

const getUserAnalyzeResult = async (req, res) => {
  try {
    // 🔐 Extract token manually (as requested)
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({
        error: "Invalid token: user ID missing"
      });
    }

    // 📦 Fetch latest AI analysis for user
    const analysis = await UserAIAnalysis.findOne({ userId })
      .sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        message: "No AI analysis found for user"
      });
    }

    return res.json({
      message: "✅ User AI analysis fetched",
      data: analysis
    });

  } catch (error) {
    console.error("❌ Get Analyze Error:", error);
    return res.status(500).json({
      message: "Failed to fetch analysis",
      error: error.message
    });
  }
};


module.exports = {
  allocateBudgetBatch,
  runUserAIAnalysisBatch,
  getUserAnalyzeResult
};
