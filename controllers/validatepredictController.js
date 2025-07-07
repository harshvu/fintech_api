const jwt = require('jsonwebtoken');
const UserStockPortfolio = require("../models/stockPortfolio.model");
const validatePredictedStock = require("../models/validatepredictedStock");
const { sendToAIPredictModel } = require("../services/aiServicePredictvalidatepre");

const validatepredictStocks = async (req, res) => {
  try {
    const io = req.app.get("io");

    // 1. Fetch all user stock portfolios
    const userStocks = await UserStockPortfolio.aggregate([
      {
        $group: {
          _id: "$userId",
          stocks: { $addToSet: "$stockName" }
        }
      }
    ]);

    // 2. Normalize stock names and prepare user map
    const globalStockSet = new Set();
    const userMap = userStocks.map(({ _id, stocks }) => {
      const sanitized = stocks.map(s => s.trim().toUpperCase());
      sanitized.forEach(stock => globalStockSet.add(stock));
      return { userId: _id, stocks: sanitized };
    });

    const uniqueStockList = Array.from(globalStockSet).sort();
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    // 3. Call AI Model
    const payload = {
      stock_name: uniqueStockList,
      date: formattedDate
    };

    const aiResponse = await sendToAIPredictModel(payload);

    console.log("📦 Raw AI Response:");
    console.dir(aiResponse, { depth: null });

    const rawResults = aiResponse.results || aiResponse || {}; // fallback if wrapped in .results

    // 4. Normalize AI response keys
    const aiResultMap = {};
    for (const key in rawResults) {
      aiResultMap[key.trim().toUpperCase()] = rawResults[key];
    }

    const results = [];

    // 5. Process each user
    for (const { userId, stocks } of userMap) {
      const userAIData = {};
      const summaryArray = [];

      console.log(`\n👤 Processing user: ${userId}, Stocks: ${stocks.join(",")}`);

      for (const stock of stocks) {
        const normalizedStock = stock.trim().toUpperCase();
        console.log(`🔍 Looking for stock: ${normalizedStock}`);
        console.log("🔑 AI Response Keys:", Object.keys(aiResultMap));

        const data = aiResultMap[normalizedStock];

        if (!data) {
          console.log(`⚠️ No AI data found for stock: ${normalizedStock}`);
          continue;
        }

        console.log(`✅ Found AI data for stock: ${normalizedStock}`);

        userAIData[normalizedStock] = data;

        summaryArray.push({
          stock: normalizedStock,
          recordCount: 1,
          averageAccuracy: (data.overall_accuracy_score || 0) * 100,
          avgPredictedGap: data.predicted_gap,
          avgActualGap: data.actual_gap,
          openingRangeAccuracyRate: data.opening_range_accuracy ? 1 : 0,
          supportLevelAccuracyRate: data.support_level_accuracy ? 1 : 0,
          resistanceLevelAccuracyRate: data.resistance_level_accuracy ? 1 : 0,
          lastUpdated: new Date()
        });
      }

      if (Object.keys(userAIData).length === 0) {
        console.log(`❌ Skipping save — no valid AI data for user: ${userId}`);
        continue;
      }

      console.log(`💾 Saving to DB for user: ${userId}`);
      console.log("🧾 Summary:", summaryArray);

      await validatePredictedStock.create({
        userId,
        date: formattedDate,
        aiResponse: userAIData,
        summary: summaryArray
      });

      results.push({ userId, savedStocks: Object.keys(userAIData).length });
    }

    return res.json({
      message: "✅ AI results saved with summary in single table",
      results
    });

  } catch (error) {
    console.error("❌ Prediction error:", error);
    return res.status(500).json({ error: "Prediction failed", details: error.message });
  }
};

module.exports = { validatepredictStocks };
