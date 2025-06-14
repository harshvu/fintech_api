const jwt = require('jsonwebtoken');
const UserStockPortfolio = require('../models/stockPortfolio.model');

exports.addStocksToPortfolio = async (req, res) => {
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
  
      const { stocks } = req.body;
  
      if (!Array.isArray(stocks) || stocks.length === 0) {
        return res.status(400).json({ error: 'Stocks must be a non-empty array' });
      }
  
      const insertedStocks = [];
  
      for (const stockName of stocks) {
        const stockEntry = new UserStockPortfolio({ userId, stockName });
        const savedStock = await stockEntry.save();
        insertedStocks.push(savedStock);
      }
  
      res.status(201).json({
        message: 'Stocks added to portfolio',
        data: insertedStocks,
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
