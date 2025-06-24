const PredictedStock = require("../models/DailyUpdates");
const { sendToAIPredictModel } = require("../services/aiDailyUpdates");

const predictStocks = async (req, res) => {
  try {
    const io = req.app.get("io");

    // Define input schema
    const payload = {
      max_stocks: 15,
      type_of_market: ["small_cap", "mid_cap", "large_cap","micro_cap","penny_stock"]
    };

    // 🔹 Send payload to AI model
    const aiResponse = await sendToAIPredictModel(payload);

    // 🔹 Save AI response with timestamp only
    const saved = await PredictedStock.create({
      aiResponse,
      timestamp: new Date()
    });

    // 🔹 Broadcast via Socket.IO
    io.emit("daily_updates", {
      message: "✅ AI Daily Update Complete",
      aiResponse
    });

    return res.json({
      message: "✅ AI response saved and broadcasted",
      result: saved
    });

  } catch (error) {
    console.error("Prediction error:", error.message);
    return res.status(500).json({ error: "Prediction failed", details: error.message });
  }
};

const getLatestPrediction = async (req, res) => {
  try {
    const latest = await PredictedStock.findOne().sort({ createdAt: -1 }).limit(1);

    if (!latest) {
      return res.status(404).json({ message: "No prediction data found" });
    }

    return res.json({
      message: "✅ Latest AI prediction fetched",
      result: latest
    });

  } catch (error) {
    console.error("Fetch error:", error.message);
    return res.status(500).json({ error: "Failed to fetch latest prediction", details: error.message });
  }
};

module.exports = { predictStocks, getLatestPrediction  };
