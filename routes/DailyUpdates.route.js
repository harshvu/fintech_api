const express = require("express");
const router = express.Router();
const { predictStocks } = require("../controllers/DailyUpdatesController");

/**
 * @swagger
 * tags:
 *   name: DailyUpdates
 *   description: AI Prediction for Stocks
 */

/**
 * @swagger
 * /api/dailyUpdates:
 *   post:
 *     summary: Trigger AI prediction per user (no auth)
 *     tags: [dailyUpdates]
 *     responses:
 *       200:
 *         description: DailyUpdates success
 *       500:
 *         description: Internal error
 */
router.post("/", predictStocks);

module.exports = router;
