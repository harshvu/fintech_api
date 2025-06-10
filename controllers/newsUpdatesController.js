const PredictedStock = require("../models/newsUpdates");
const { sendToAIPredictModel } = require("../services/aiNewsUpdates");

const predictStocks = async (req, res) => {
  try {
    const io = req.app.get("io");
    const aiResponse = await sendToAIPredictModel(); // assumes default inside service
 // 🔹 Save AI response with timestamp only
    const saved = await PredictedStock.create({
      aiResponse,
      timestamp: new Date()
      
    });

    // 🔹 Broadcast via Socket.IO
    io.emit("news_updates", {
      message: "✅ AI News Update Complete",
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

module.exports = { predictStocks };
