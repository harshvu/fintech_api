const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const UserStockPortfolio = require("../models/stockPortfolio.model");
const validatePredictedStock = require("../models/validatepredictedStockIn");
const { sendToAIPredictModel } = require("../services/aiServicePredictvalidateIn");

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
// ✅ Controller: Save AI Predictions and Summary
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

    const uniqueStockList = Array.from(globalStockSet);
    const formattedDate = new Date().toISOString().split("T")[0];

    const payload = { stock_name: uniqueStockList };
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

        if (!data || !data.validation_scores) continue;

        userAIData[normalizedStock] = data;

        summaryMap[normalizedStock] = {
          overall_score: data.validation_scores.aggregate_score,
          grade: data.validation_scores.score_grade,
          confidence: data.decision?.confidence || "N/A",
          validation_breakdown: {
            basic_checks: data.validation_scores.layer_scores.immediate.score,
            investment_logic: data.validation_scores.layer_scores.thesis.score,
            market_timing: data.validation_scores.layer_scores.market_context.score
          },
          track_record: {
            accuracy: data.validation_stats.system_accuracy,
            avg_approved_return: data.validation_stats.avg_return_validated_trades,
            avg_rejected_return: data.validation_stats.avg_return_rejected_trades,
            trades_protected: data.validation_stats.total_trades_protected
          },
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
          averageAccuracy: average(entries.map(e => parseFloat(e.track_record.accuracy) || 0)),
          overallScore: average(entries.map(e => e.overall_score)),
          avgApprovedReturn: average(entries.map(e => parseFloat(e.track_record.avg_approved_return) || 0)),
          avgRejectedReturn: average(entries.map(e => parseFloat(e.track_record.avg_rejected_return) || 0))
        };

        const today_average = todayData ? {
          averageAccuracy: parseFloat(todayData.track_record.accuracy) || 0,
          overallScore: todayData.overall_score || 0,
          avgApprovedReturn: parseFloat(todayData.track_record.avg_approved_return) || 0,
          avgRejectedReturn: parseFloat(todayData.track_record.avg_rejected_return) || 0
        } : {};

        summaryResponse[stock] = {
          overall_average,
          today_average
        };
      }

      if (Object.keys(summaryResponse).length > 0) {
        io.emit("validation_summary_in", {
          userId,
          message: `✅ AI validate summary pre market complete for user ${userId}`,
          summaryData: summaryResponse
        });
      }

      results.push({ userId, savedStocks: Object.keys(userAIData).length });
    }

    return res.json({ message: "✅ AI results saved and emitted with summaries", results });

  } catch (error) {
    console.error("❌ Prediction error:", error);
    return res.status(500).json({
      error: "Prediction failed",
      details: error.message
    });
  }
};

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
        averageAccuracy: average(entries.map(e => parseFloat(e.track_record?.accuracy) || 0)),
        overallScore: average(entries.map(e => e.overall_score || 0)),
        avgApprovedReturn: average(entries.map(e => parseFloat(e.track_record?.avg_approved_return) || 0)),
        avgRejectedReturn: average(entries.map(e => parseFloat(e.track_record?.avg_rejected_return) || 0))
      };

      const today_average = todayData ? {
        averageAccuracy: parseFloat(todayData.track_record?.accuracy) || 0,
        overallScore: todayData.overall_score || 0,
        avgApprovedReturn: parseFloat(todayData.track_record?.avg_approved_return) || 0,
        avgRejectedReturn: parseFloat(todayData.track_record?.avg_rejected_return) || 0
      } : {};

      response[stock] = {
        overall_average,
        today_average,
        grade: todayData?.grade || null,
        confidence: todayData?.confidence || null,
        validation_breakdown: todayData?.validation_breakdown || {},
        track_record: todayData?.track_record || {}
      };
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error("❌ Error in getSummaryByUser:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
};
// Helpers
module.exports = {
  validatepredictStocks,
  getSummaryByUser
};
