const express = require("express");
const router = express.Router();
const chatCtrl = require("../controllers/chat.controller");
const auth = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Manage user Search  (protected)
 */

/**
 * @swagger
 * /api/search/save:
 *   post:
 *     summary: Save a chat message
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - question
 *               - answer
 *             properties:
 *               chatId:
 *                 type: string
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *                core_conclusion:
 *                 type: string
 *              source_used:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat saved successfully
 */
router.post("/save", auth, chatCtrl.saveChat);

/**
 * @swagger
 * /api/search/history:
 *   get:
 *     summary: Get grouped chat history by chat ID
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grouped chat history
 */
router.get("/history", auth, chatCtrl.getChatHistory);
/**
 * @swagger
 * /api/search/{chatId}:
 *   get:
 *     summary: Get chat messages by chat ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the chat to retrieve
 *     responses:
 *       200:
 *         description: Chat messages for the specified chat ID
 */
router.get("/:chatId", auth, chatCtrl.getChatById);

module.exports = router;
