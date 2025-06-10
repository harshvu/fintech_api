const UserStockPortfolio = require("../models/stockPortfolio.model");
const PredictedStock = require("../models/predictedStock");
const { sendToAIPredictModel } = require("../services/aiServicePredict");

const predictStocks = async (req, res) => {
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

    const results = [];

    for (const user of userStocks) {
      const { _id: userId, stocks } = user;

      const alreadyPredicted = await PredictedStock.findOne({ userId });
      if (alreadyPredicted) {
        console.log(`Prediction already exists for user ${userId}, skipping.`);
        continue;
      }

      const sanitizedTickers = stocks.map(s => s.replace(/\.BO$/, '').toUpperCase());

      const payload = {
        ticker: sanitizedTickers,
        include_risk_analysis: true,
        include_technical_levels: true,
        include_trading_signals: true,
        include_market_context: true,
        custom_analysis: {
          additionalProp1: {}
        }
      };

      const aiResponse = await sendToAIPredictModel(payload);

      await PredictedStock.create({
        userId,
        stockNames: stocks,
        aiResponse
      });

      // Emit real-time socket event for this user
      io.emit("prediction_complete", {
        userId,
        message: `✅ AI prediction completed for user ${userId}`,
        aiResponse
      });

      results.push({ userId, status: "saved" });
    }

    return res.json({ message: "Prediction process complete", results });
  } catch (error) {
    console.error("Prediction error:", error.message);
    return res.status(500).json({ error: "Prediction failed", details: error.message });
  }
};

module.exports = { predictStocks };
