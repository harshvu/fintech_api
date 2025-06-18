const jwt = require('jsonwebtoken');
const UserStockPortfolio = require("../models/stockPortfolio.model");
const PredictedStock = require("../models/predictedStock");
const { sendToAIPredictModel } = require("../services/aiServicePredict");

const predictStocks = async (req, res) => {
  try {
    const io = req.app.get("io");

    // 1. Fetch each user's stock list
    const userStocks = await UserStockPortfolio.aggregate([
      {
        $group: {
          _id: "$userId",
          stocks: { $addToSet: "$stockName" }
        }
      }
    ]);

    const stockSetMap = new Map(); // { stockKey -> [userInfo, ...] }

    // 2. Group users by their stock list
    for (const user of userStocks) {
      const { _id: userId, stocks } = user;

      const sanitizedTickers = stocks.map(s => s.replace(/\.BO$/, '').toUpperCase()).sort();
      const stockKey = sanitizedTickers.join(",");

      if (!stockSetMap.has(stockKey)) {
        stockSetMap.set(stockKey, {
          tickers: sanitizedTickers,
          users: []
        });
      }

      stockSetMap.get(stockKey).users.push({ userId, stockNames: sanitizedTickers });
    }

    const results = [];

    // 3. For each unique stock group, call AI once
    for (const [key, { tickers, users }] of stockSetMap.entries()) {
      const payload = {
        ticker: tickers,
        include_risk_analysis: true,
        include_technical_levels: true,
        include_trading_signals: true,
        include_market_context: true,
        custom_analysis: {
          additionalProp1: {}
        }
      };

      const aiResponse = await sendToAIPredictModel(payload);

      // 4. Save for each user individually
      for (const { userId, stockNames } of users) {
        await PredictedStock.create({
          userId,
          stockNames,
          aiResponse
        });

        io.emit("prediction_complete", {
          userId,
          message: `✅ AI prediction completed for user ${userId}`,
          aiResponse
        });

        results.push({ userId, status: "saved" });
      }
    }

    return res.json({ message: "✅ Prediction complete", results });

  } catch (error) {
    console.error("Prediction error:", error.message);
    return res.status(500).json({ error: "Prediction failed", details: error.message });
  }
};

const getLatestPrediction = async (req, res) => {
  try {
        const authHeader = req.headers.authorization;
      
          if (!authHeader) {
            return res.status(401).json({ error: 'Authorization token missing' });
          }
      
          // Extract token (whether it's with or without "Bearer")
          let token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      
          // Decode token
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id || decoded._id;
          console.log("this is user"+userId);
          if (!userId) {
            return res.status(401).json({ error: 'Invalid token: user ID missing' });
          }
       // 🔐 Extracted from JWT token by middleware

       const latestPrediction = await PredictedStock
       .findOne({ userId })
       .sort({ createdAt: -1 })
       .select('aiResponse -_id'); 
      
    // console.log("MongoDB explain output:", JSON.stringify(latestPrediction, null, 2));

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

module.exports = { predictStocks,getLatestPrediction };
