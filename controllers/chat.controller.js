const jwt = require('jsonwebtoken');
const UserChat = require("../models/UserChat");

exports.saveChat = async (req, res) => {
  const { chatId, question, answer,core_conclusion,source_used,portfolio } = req.body;
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
      answer,
      core_conclusion,
      source_used,
      portfolio
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
      { $sort: { createdAt: 1 } }, // sort oldest to newest to get first question correctly
      {
        $group: {
          _id: "$chatId",
          first_question: { $first: "$question" },
          messages: {
            $push: {
              question: "$question",
              answer: "$answer",
              core_conclusion:"$core_conclusion",
              source_used:"$source_used",
              portfolio: "$portfolio",
              createdAt: "$createdAt"
            }
          },
          lastMessageTime: { $last: "$createdAt" } // used for sorting by activity
        }
      },
      { $sort: { lastMessageTime: -1 } } // 🔁 sort threads by latest activity
    ]);

    const response = {
      sidebar: chats.map(c => ({
        chatId: c._id,
        first_question: c.first_question
      })),
      last_chat_id: chats[0]?._id || null,
      last_chat_data: chats[0]?.messages || []
    };

    return res.json(response);
  } catch (error) {
    console.error("GetChatHistory Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch chat history" });
  }
};


exports.getChatById = async (req, res) => {
  const userId = req.user.id;
  const chatId = req.params.chatId;

  try {
    const chatData = await UserChat.find({ userId, chatId }).sort({ createdAt: -1 });

    if (!chatData || chatData.length === 0) {
      return res.status(404).json({ message: "Chat not found or unauthorized access." });
    }

    return res.json({ chatId, chatData });
  } catch (error) {
    console.error("GetChatById Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch chat messages" });
  }
};

