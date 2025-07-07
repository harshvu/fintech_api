// ✅ validate.controller.js (full corrected code)

const jwt = require('jsonwebtoken');
const UserStockPortfolio = require("../models/stockPortfolio.model");
const validatePredictedStock = require("../models/validatepredictedStock");
const { sendToAIPredictModel } = require("../services/aiServicePredictvalidatepre");

// ✅ Prediction and Saving Controller
const validatepredictStocks = async (req, res) => {
  try {
    const io = req.app.get("io");
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

    const uniqueStockList = Array.from(globalStockSet).sort();
    const formattedDate = new Date().toISOString().split("T")[0];

    const payload = { stock_name: uniqueStockList, date: formattedDate };
    const aiResponse = await sendToAIPredictModel(payload);
    const rawResults = aiResponse.results || aiResponse || {};

    const aiResultMap = {};
    for (const key in rawResults) {
      aiResultMap[key.trim().toUpperCase()] = rawResults[key];
    }

    const results = [];
    for (const { userId, stocks } of userMap) {
      const userAIData = {};
      const summaryMap = {};

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

      await validatePredictedStock.create({
        userId,
        date: formattedDate,
        aiResponse: userAIData,
        summary: summaryMap
      });

      results.push({ userId, savedStocks: Object.keys(userAIData).length });
    }

    return res.json({ message: "✅ AI results saved with summary", results });
  } catch (error) {
    console.error("❌ Prediction error:", error);
    return res.status(500).json({ error: "Prediction failed", details: error.message });
  }
};

// ✅ Get Summary API
const getSummaryByUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;
    if (!userId) return res.status(401).json({ error: "Invalid token" });

    const today = new Date().toISOString().split("T")[0];
    const userRecords = await validatePredictedStock.find({ userId });
    if (!userRecords.length) return res.status(404).json({ message: "No data found for this user." });

    const stockMap = {};
    for (const record of userRecords) {
      const isToday = record.date === today;
      const summary = record.summary || {};

      for (const stockSymbol in summary) {
        const data = summary[stockSymbol];
        if (!stockMap[stockSymbol]) stockMap[stockSymbol] = { overall: [], today: null };
        stockMap[stockSymbol].overall.push(data);
        if (isToday) stockMap[stockSymbol].today = data;
      }
    }

    const response = {};
    for (const stock in stockMap) {
      const entries = stockMap[stock].overall;
      const todayData = stockMap[stock].today;

      const overall_average = {
        averageAccuracy: average(entries.map(e => e.averageAccuracy)),
        avgPredictedGap: average(entries.map(e => e.avgPredictedGap)),
        avgActualGap: average(entries.map(e => e.avgActualGap)),
        openingRangeAccuracyRate: percentage(entries.map(e => e.openingRangeAccuracyRate)),
        supportLevelAccuracyRate: percentage(entries.map(e => e.supportLevelAccuracyRate)),
        resistanceLevelAccuracyRate: percentage(entries.map(e => e.resistanceLevelAccuracyRate))
      };

      const today_average = todayData ? {
        averageAccuracy: todayData.averageAccuracy || 0,
        avgPredictedGap: todayData.avgPredictedGap || 0,
        avgActualGap: todayData.avgActualGap ? 100 : 0,
        openingRangeAccuracyRate: todayData.openingRangeAccuracyRate ? 100 : 0,
        supportLevelAccuracyRate: todayData.supportLevelAccuracyRate ? 100 : 0,
        resistanceLevelAccuracyRate: todayData.resistanceLevelAccuracyRate ? 100 : 0
      } : {};

      response[stock] = {
        Overall_average: overall_average,
        today_average
      };
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error("❌ Error in summary API:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

function average(arr) {
  if (!arr.length) return 0;
  const total = arr.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  return parseFloat((total / arr.length).toFixed(2));
}

function percentage(arr) {
  if (!arr.length) return 0;
  const trueCount = arr.filter(v => v === 1).length;
  return parseFloat(((trueCount / arr.length) * 100).toFixed(2));
}

module.exports = { validatepredictStocks, getSummaryByUser };
