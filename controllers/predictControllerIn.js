const jwt = require('jsonwebtoken');
const UserStockPortfolio = require("../models/stockPortfolio.model");
const PredictedStock = require("../models/predictedStockIn");
const { sendToAIPredictModel } = require("../services/aiServicePredictIn");

const predictStocks = async (req, res) => {
  try {
    const userStocks = await UserStockPortfolio.aggregate([
      {
        $group: {
          _id: "$userId",
          stocks: { $addToSet: "$stockName" }
        }
      }
    ]);

    // Step 2: Create a Set of all unique stocks across all users
    const globalStockSet = new Set();

    const userMap = userStocks.map(({ _id, stocks }) => {
      const sanitized = stocks.map(s => s.replace(/\.BO$/, '').toUpperCase());
      sanitized.forEach(stock => globalStockSet.add(stock));
      return { userId: _id, stocks: sanitized };
    });

    const uniqueStockList = Array.from(globalStockSet).sort();

    // Step 3: Prepare payload and send to AI once
    const payload = {
      ticker: uniqueStockList,
      is_market_open:"open"
     
    };

    const aiResponse = await sendToAIPredictModel(payload);

    // 🔁 Step 3.5: Convert { res1, res2, ... } into { ticker: data }
    const tickerToDataMap = {};
    const resultsFromAI = aiResponse.results || {};

    for (const key in resultsFromAI) {
      const result = resultsFromAI[key];
      const ticker = result?.ticker?.toUpperCase();
      if (ticker) {
        tickerToDataMap[ticker] = result;
      }
    }

    // Step 4: Store and emit per user
    const results = [];

    for (const { userId, stocks } of userMap) {
      const filteredResponse = {};

      for (const stock of stocks) {
        if (tickerToDataMap[stock]) {
          filteredResponse[stock] = tickerToDataMap[stock];
        }
      }

      if (Object.keys(filteredResponse).length === 0) {
        console.log(`No AI response found for user ${userId}, skipping.`);
        continue;
      }

      await PredictedStock.create({
        userId,
        stockNames: stocks,
        aiResponse: filteredResponse
      });

      

      results.push({ userId, status: "saved" });
    }

    return res.json({ message: "✅ AI called once, user responses saved", results});

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
