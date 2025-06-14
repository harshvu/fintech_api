const UserStockPortfolio = require("../models/stockPortfolio.model");
const PremarketUser = require("../models/premarket.model");
const axios = require("axios");

const predictPremarketStocks = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const portfolios = await UserStockPortfolio.aggregate([
      {
        $group: {
          _id: "$userId",
          stocks: { $addToSet: "$stockName" }
        }
      }
    ]);

    const results = [];

    for (const user of portfolios) {
      const userId = user._id;

      const alreadyExists = await PremarketUser.findOne({
        userId,
        date: today
      });

      if (alreadyExists) {
        results.push({ userId, status: "already predicted" });
        continue;
      }

      const payload = {
        ticker: user.stocks, // Assuming array of stocks
        days_back: 60,
        include_extended_features: true,
        custom_parameters: {
          additionalProp1: {}
        }
      };

      const aiResponse = await axios.post("http://localhost:8001/train", payload);

      await PremarketUser.create({
        userId,
        stockNames: user.stocks,
        aiResponse: aiResponse.data,
        date: today
      });

      results.push({ userId, status: "predicted", response: aiResponse.data });
    }

    return res.json({ message: "Premarket prediction complete", results });

  } catch (err) {
    console.error("Premarket prediction error:", err.message);
    return res.status(500).json({ error: "Prediction failed", details: err.message });
  }
};

module.exports = { predictPremarketStocks };
