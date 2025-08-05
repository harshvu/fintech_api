const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const UserStockPortfolio = require("../models/stockPortfolio.model");
const validatePredictedStock = require("../models/validatepredictedStock");
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

    console.log("🔍 Sending payload to AI model:", payload);
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

        if (!data) {
          console.warn(`⚠️ No AI data for stock: ${normalizedStock}`);
          continue;
        }

        userAIData[normalizedStock] = data;

        summaryMap[normalizedStock] = {
          recordCount: 1,
          averageAccuracy: data.overall_accuracy || 0,
          avgPredictedGap: data.predicted_gap_percentage || 0,
          avgActualGap: data.direction_correct ? 1 : 0, // <== Based on your request
          directionAccuracyRate: data.direction_correct ? 1 : 0,
          openingRangeAccuracyRate: data.gap_type_correct ? 1 : 0,
          supportLevelAccuracyRate: data.support_level_accuracy ? 1 : 0,
          resistanceLevelAccuracyRate: data.resistance_level_accuracy ? 1 : 0,
          predicted_range_lower: data.predicted_range_lower || null,
          predicted_range_upper: data.predicted_range_upper || null,
          actual_opening: data.actual_open || null,
          lastUpdated: new Date()
        };
      }

      if (Object.keys(userAIData).length === 0) {
        console.log(`ℹ️ No valid predictions for user ${userId}, skipping save.`);
        continue;
      }

      await validatePredictedStock.create({
        userId,
        date: formattedDate,
        aiResponse: userAIData,
        summary: summaryMap
      });

      const userRecords = await validatePredictedStock.find({ userId });
      const stockMap = {};

      for (const record of userRecords) {
        const isToday = record.date === formattedDate;
        const summary = record.summary || {};

        for (const stockSymbol in summary) {
          const data = summary[stockSymbol];
          if (!stockMap[stockSymbol]) {
            stockMap[stockSymbol] = {
              overall: [],
              today: null
            };
          }

          stockMap[stockSymbol].overall.push(data);
          if (isToday) {
            stockMap[stockSymbol].today = data;
          }
        }
      }

      const summaryResponse = {};

      for (const stock in stockMap) {
        const entries = stockMap[stock].overall;
        const todayData = stockMap[stock].today;

        const overall_average = {
          averageAccuracy: average(entries.map(e => e.averageAccuracy)),
          avgPredictedGap: average(entries.map(e => e.avgPredictedGap)),
          avgActualGap: percentage(entries.map(e => e.avgActualGap)),
          openingRangeAccuracyRate: percentage(entries.map(e => e.openingRangeAccuracyRate)),
          supportLevelAccuracyRate: percentage(entries.map(e => e.supportLevelAccuracyRate)),
          resistanceLevelAccuracyRate: percentage(entries.map(e => e.resistanceLevelAccuracyRate))
        };

        const today_average = todayData ? {
          averageAccuracy: todayData.averageAccuracy || 0,
          avgPredictedGap: todayData.avgPredictedGap || 0,
          avgActualGap: todayData.avgActualGap ? 100: 0,
          openingRangeAccuracyRate: todayData.openingRangeAccuracyRate ? 100 : 0,
          supportLevelAccuracyRate: todayData.supportLevelAccuracyRate ? 100 : 0,
          resistanceLevelAccuracyRate: todayData.resistanceLevelAccuracyRate ? 100 : 0
        } : {};

        summaryResponse[stock] = {
          Overall_average: overall_average,
          today_average
        };
      }

      results.push({ userId, savedStocks: Object.keys(userAIData).length });
    }

    return res.json({
      message: "✅ AI results saved with updated summary format",
      results
    });

  } catch (error) {
    console.error("❌ Prediction error:", error);
    return res.status(500).json({
      error: "Prediction failed",
      details: error.message
    });
  }
};

// Utility functions



// Utility functions
function average(arr) {
  const valid = arr.filter(n => typeof n === 'number');
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

function percentage(arr) {
  const valid = arr.filter(n => typeof n === 'number');
  return valid.length ? (valid.reduce((a, b) => a + b, 0) / valid.length) * 100 : 0;
}

// ✅ Controller: Get Summary Data by User

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

    if (!userRecords.length) {
      return res.status(404).json({ message: "No data found for this user." });
    }

    const stockMap = {};

    for (const record of userRecords) {
      const isToday = record.date === today;
      const summary = record.summary || {};

      for (const stockSymbol in summary) {
        const data = summary[stockSymbol];
        if (!stockMap[stockSymbol]) {
          stockMap[stockSymbol] = {
            overall: [],
            today: null
          };
        }

        stockMap[stockSymbol].overall.push(data);

        if (isToday) {
          stockMap[stockSymbol].today = data;
        }
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
        avgActualGap: todayData.avgActualGap || 0,
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

// Helpers
module.exports = {
  validatepredictStocks,
  getSummaryByUser
};
