const jwt = require('jsonwebtoken');
const UserStockPortfolio = require('../models/stockPortfolio.model');

exports.addStocksToPortfolio = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    let token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token: user ID missing' });
    }

    const { stocks } = req.body;

    if (!Array.isArray(stocks) || stocks.length === 0) {
      return res.status(400).json({ error: 'Stocks must be a non-empty array' });
    }

    const insertedStocks = [];
    const skippedStocks = [];

    for (const stockName of stocks) {
      const exists = await UserStockPortfolio.findOne({ userId, stockName });

      if (!exists) {
        const stockEntry = new UserStockPortfolio({ userId, stockName });
        const savedStock = await stockEntry.save();
        insertedStocks.push(savedStock);
      } else {
        skippedStocks.push(stockName);
      }
    }

    res.status(201).json({
      message: 'Stocks processed successfully',
      inserted: insertedStocks,
      skipped: skippedStocks
    });

  } catch (err) {
    console.error('Error adding stocks:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getUserStocks = async (req, res) => {
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
  
      if (!userId) {
        return res.status(401).json({ error: 'Invalid token: user ID missing' });
      }
    
    const stocks = await UserStockPortfolio.find({ userId });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching stocks' });
  }
};
exports.deleteStockById = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await UserStockPortfolio.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    return res.status(200).json({
      message: '✅ Stock deleted successfully',
      deletedStock: deleted,
    });

  } catch (error) {
    console.error('Delete stock error:', error.message);
    return res.status(500).json({ error: 'Failed to delete stock', details: error.message });
  }
};
