const UserStockPortfolio = require("../models/stockPortfolio.model");
const TrainStock = require("../models/trainStock");
const { sendToAIModel } = require("../services/aiService");

const trainStocks = async (req, res) => {
  try {
    // Step 1: Fetch distinct stock names
    const distinctStocks = await UserStockPortfolio.distinct("stockName");
    
    if (distinctStocks.length === 0) {
      return res.status(404).json({ message: "No stock names found in userStockPortfolio" });
    }
    // console.log("Distinct Stocks JSON:", JSON.stringify(distinctStocks, null, 2));
    // return false;
    // Step 2: Prepare payload and send to AI model
    const user_id = "admin"; // or from auth/session
    const aiResponse = await sendToAIModel({
      ticker: distinctStocks,
      user_id
    });

    // Step 3: Save result to trainStock collection
    await TrainStock.create({
      stock_names: distinctStocks.join(","),
      ai_response: aiResponse
    });

    return res.json({ message: "Training successful", data: aiResponse });
  } catch (error) {
    console.error("Training error:", error.message);
    return res.status(500).json({ error: "Training failed", details: error.message });
  }
};

module.exports = { trainStocks };
