const jwt = require('jsonwebtoken');
const UserStockPortfolio = require("../models/stockPortfolio.model");
const validatePredictedStock = require("../models/validatepredictedStock");
const { sendToAIPredictModel } = require("../services/aiServicePredictvalidatepre");

const validatepredictStocks = async (req, res) => {
  try {
    const io = req.app.get("io");

    // Step 1: Fetch all user portfolios
    const userStocks = await UserStockPortfolio.aggregate([
      {
        $group: {
          _id: "$userId",
          stocks: { $addToSet: "$stockName" }
        }
      }
    ]);

    // Step 2: Prepare stock list and normalize with .NS suffix
    const globalStockSet = new Set();
    const userMap = userStocks.map(({ _id, stocks }) => {
      const normalizedStocks = stocks.map(s => {
        let clean = s.trim().toUpperCase();
        if (!clean.endsWith('.NS')) clean += '.NS';
        globalStockSet.add(clean);
        return clean;
      });
      return { userId: _id, stocks: normalizedStocks };
    });

    const uniqueStockList = Array.from(globalStockSet).sort();
    const formattedDate = new Date().toISOString().split("T")[0];

    // Step 3: Call AI model
    const payload = {
      stock_name: uniqueStockList,
      date: formattedDate
    };

    const aiResponse = await sendToAIPredictModel(payload);
    console.log("📦 Raw AI Response:");
    console.dir(aiResponse, { depth: null });

    const rawResults = aiResponse.results || {};

    // Normalize AI response keys
    const aiResultMap = {};
    for (const key in rawResults) {
      aiResultMap[key.trim().toUpperCase()] = rawResults[key];
    }

    const results = [];

    for (const { userId, stocks } of userMap) {
      const userAIData = {};
      const summaryArray = [];

      console.log(`👤 Processing user: ${userId}, Stocks: ${stocks.join(",")}`);

      for (const stock of stocks) {
        const data = aiResultMap[stock.trim().toUpperCase()];

        if (!data) {
          console.log(`⚠️ No AI data found for stock: ${stock}`);
          continue;
        }

        userAIData[stock] = data;

        summaryArray.push({
          stock,
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

const getLatestPrediction = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization token missing' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token: user ID missing' });
    }

    const latestPrediction = await validatePredictedStock
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .select('aiResponse summary date -_id');

    if (!latestPrediction) {
      return res.status(404).json({ message: "No prediction found for this user." });
    }

    return res.status(200).json({
      message: "Latest prediction fetched successfully",
      data: latestPrediction
    });

  } catch (error) {
    console.error("Error fetching latest prediction:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  validatepredictStocks,
  getLatestPrediction
};
