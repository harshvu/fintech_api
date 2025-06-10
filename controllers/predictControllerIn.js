const UserStockPortfolio = require("../models/stockPortfolio.model");
const PredictedStock = require("../models/predictedStockIn");
const { sendToAIPredictModel } = require("../services/aiServicePredictIn");

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
        user_id:userId
      };

      const aiResponse = await sendToAIPredictModel(payload);

      await PredictedStock.create({
        userId,
        stockNames: stocks,
        aiResponse
      });

      // Emit real-time socket event for this user
      io.emit("In_market_prediction_complete", {
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
