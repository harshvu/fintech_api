const User = require('../models/user.model');
const UserStockPortfolio = require("../models/stockPortfolio.model");
const Feedback = require('../models/Feedback');
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // exclude password from response

    res.json({
      message: 'All users fetched successfully',
      users,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.getAllUserPortfolios = async (req, res) => {
  try {
    const portfolios = await UserStockPortfolio.aggregate([
      {
        $lookup: {
          from: 'users', // collection name in MongoDB (should be lowercase plural of model)
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          user: { $first: '$user' },
          stocks: { $push: '$stockName' },
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          stocks: 1,
        },
      },
    ]);

    res.json({
      message: 'User portfolios fetched successfully',
      data: portfolios,
    });
  } catch (err) {
    console.error('Error fetching portfolios:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email') // Get user's name and email only
      .sort({ createdAt: -1 }); // Optional: latest first

    res.json({
      message: 'Feedback list fetched successfully',
      data: feedbacks,
    });
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ error: 'Server error' });
  }
};