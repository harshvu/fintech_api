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
 * /api/chat/save:
 *   post:
 *     summary: Save a chat message
 *     tags: [Chats]
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
 *     responses:
 *       200:
 *         description: Chat saved successfully
 */
router.post("/save", auth, chatCtrl.saveChat);

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     summary: Get grouped chat history by chat ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grouped chat history
 */
router.get("/history", auth, chatCtrl.getChatHistory);

module.exports = router;
