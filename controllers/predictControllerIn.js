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
      io.emit("In_market_ prediction_complete", {
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
