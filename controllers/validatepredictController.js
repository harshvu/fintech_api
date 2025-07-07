const jwt = require('jsonwebtoken');
const UserStockPortfolio = require("../models/stockPortfolio.model");
const validatePredictedStock = require("../models/validatepredictedStock");
const { sendToAIPredictModel } = require("../services/aiServicePredictvalidatepre");

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
      const sanitized = stocks.map(s => s.replace(/\.BO$/, '').toUpperCase());
      sanitized.forEach(stock => globalStockSet.add(stock));
      return { userId: _id, stocks: sanitized };
    });

    const uniqueStockList = Array.from(globalStockSet).sort();
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    const payload = {
      stock_name: uniqueStockList,
      date: formattedDate
    };

    const aiResponse = await sendToAIPredictModel(payload);

    console.log("📦 Raw AI Response:");
    console.dir(aiResponse, { depth: null }); // deep console.log

    const rawResults = aiResponse.results || {};
    const aiResultMap = {};

    for (const key in rawResults) {
      const normalizedKey = key.replace(/\.NS$/, '').toUpperCase();
      aiResultMap[normalizedKey] = rawResults[key];
    }

    const results = [];

    for (const { userId, stocks } of userMap) {
      const userAIData = {};
      const summary = {};

      console.log(`👤 Processing user: ${userId}, Stocks: ${stocks}`);

      for (const stock of stocks) {
        const data = aiResultMap[stock];

        if (!data) {
          console.log(`⚠️ No AI data found for stock: ${stock}`);
          continue;
        }

        console.log(`✅ AI data for ${stock}:`, data);

        userAIData[stock] = data;

        summary[stock] = {
          stock_symbol: data.stock_symbol,
          overall_accuracy_score: (data.overall_accuracy_score || 0) * 100,
          predicted_gap: data.predicted_gap,
          actual_gap: data.actual_gap,
          opening_range_accuracy: data.opening_range_accuracy ? 1 : 0,
          predicted_range_lower: data.predicted_range_lower,
          predicted_range_upper: data.predicted_range_upper,
          actual_opening: data.actual_opening,
          support_level_accuracy: data.support_level_accuracy ? 1 : 0,
          resistance_level_accuracy: data.resistance_level_accuracy ? 1 : 0
        };
      }

      if (Object.keys(userAIData).length === 0) {
        console.log(`❌ Skipping save — no valid AI data for user: ${userId}`);
        continue;
      }

      console.log(`💾 Saving to DB for user: ${userId}`);
      console.log("🧾 Summary:", summary);

      await validatePredictedStock.create({
        userId,
        date: formattedDate,
        aiResponse: userAIData,
        summary
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

module.exports = { validatepredictStocks,getLatestPrediction };
