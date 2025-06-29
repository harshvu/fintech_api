const jwt = require('jsonwebtoken');
const UserChat = require("../models/UserChat");

exports.saveChat = async (req, res) => {
  const { chatId, question, answer } = req.body;
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
        
        
        if (!chatId || !question || !answer) {
            return res.status(400).json({ error: "chatId, question, and answer are required" });
        }

  try {
    const chat = new UserChat({
      userId,
      chatId,
      question,
      answer
    });

    await chat.save();
    return res.json({ message: "Chat saved successfully" });
  } catch (error) {
    console.error("SaveChat Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getChatHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const chats = await UserChat.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$chatId",
          messages: {
            $push: {
              question: "$question",
              answer: "$answer",
              createdAt: "$createdAt"
            }
          }
        }
      },
      { $sort: { "_id": -1 } }
    ]);

    return res.json({ chats });
  } catch (error) {
    console.error("GetChatHistory Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch chat history" });
  }
};
