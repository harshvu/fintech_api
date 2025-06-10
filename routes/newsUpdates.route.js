const express = require("express");
const router = express.Router();
const { predictStocks } = require("../controllers/newsUpdatesController");

/**
 * @swagger
 * tags:
 *   name: NewsUpdates
 *   description: AI Prediction for Stocks
 */

/**
 * @swagger
 * /api/newsUpdates:
 *   post:
 *     summary: Trigger AI prediction per user (no auth)
 *     tags: [newsUpdates]
 *     responses:
 *       200:
 *         description: NewsUpdates success
 *       500:
 *         description: Internal error
 */
router.post("/", predictStocks);

module.exports = router;
