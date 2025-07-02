const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  const userId = req.user.id;
  const { rating, option, message } = req.body;

  try {
    if (!rating || !option) {
      return res.status(400).json({ error: "Rating and option are required" });
    }

    const feedback = new Feedback({
      userId,
      rating,
      option,
      message
    });

    await feedback.save();

    return res.status(201).json({ message: "✅ Feedback submitted successfully", feedback });
  } catch (error) {
    console.error("SubmitFeedback Error:", error.message);
    return res.status(500).json({ error: "Failed to submit feedback" });
  }
};
