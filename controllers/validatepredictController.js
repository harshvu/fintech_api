const validatePredictedStock = require("../models/validatePredictedStock");
const UserStockPortfolio = require("../models/stockPortfolio.model");
const { sendToAIPredictModel } = require("../services/aiServicePredictvalidatepre");

const validatepredictStocks = async (req, res) => {
  try {
    const userStocks = await UserStockPortfolio.aggregate([
      {
        $group: {
          _id: "$userId",
          stocks: { $addToSet: "$stockName" }
        }
      }
    ]);

    const globalStockSet = new Set();
    const userMap = userStocks.map(({ _id, stocks }) => {
      const sanitized = stocks.map(s => s.trim().toUpperCase());
      sanitized.forEach(stock => globalStockSet.add(stock));
      return { userId: _id, stocks: sanitized };
    });

    const uniqueStockList = Array.from(globalStockSet);
    const formattedDate = new Date().toISOString().split("T")[0];

    const payload = {
      stock_name: uniqueStockList,
      date: formattedDate
    };

    const aiResponse = await sendToAIPredictModel(payload);
    const rawResults = aiResponse.results || aiResponse || {};

    // Normalize keys
    const aiResultMap = {};
    for (const key in rawResults) {
      aiResultMap[key.trim().toUpperCase()] = rawResults[key];
    }

    const results = [];

    for (const { userId, stocks } of userMap) {
      const userAIData = {};
      const summaryMap = {}; // ⬅️ Must be a plain JS object

      for (const stock of stocks) {
        const normalizedStock = stock.toUpperCase();
        const data = aiResultMap[normalizedStock];
        if (!data) continue;

        userAIData[normalizedStock] = data;

        summaryMap[normalizedStock] = {
          recordCount: 1,
          averageAccuracy: (data.overall_accuracy_score || 0) * 100,
          avgPredictedGap: data.predicted_gap,
          avgActualGap: data.actual_gap,
          openingRangeAccuracyRate: data.opening_range_accuracy ? 1 : 0,
          supportLevelAccuracyRate: data.support_level_accuracy ? 1 : 0,
          resistanceLevelAccuracyRate: data.resistance_level_accuracy ? 1 : 0,
          predicted_range_lower: data.predicted_range_lower,
          predicted_range_upper: data.predicted_range_upper,
          actual_opening: data.actual_opening,
          lastUpdated: new Date()
        };
      }

      if (Object.keys(userAIData).length === 0) continue;

      // ✅ Save using correct JS object format — NOT Map() or string
      await validatePredictedStock.create({
        userId,
        date: formattedDate,
        aiResponse: userAIData,
        summary: summaryMap
      });

      results.push({ userId, savedStocks: Object.keys(userAIData).length });
    }

    return res.json({ message: "✅ AI results saved", results });

  } catch (error) {
    console.error("❌ Prediction error:", error);
    return res.status(500).json({
      error: "Prediction failed",
      details: error.message
    });
  }
};

module.exports = { validatepredictStocks };
