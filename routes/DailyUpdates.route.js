const express = require("express");
const router = express.Router();
const { predictStocks, getLatestPrediction } = require("../controllers/DailyUpdatesController");

/**
 * @swagger
 * tags:
 *   name: dailyUpdates stocks
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

/**
 * @swagger
 * /api/dailyUpdates/latestDailyUpdates:
 *   get:
 *     summary: Get latest AI prediction
 *     tags: [dailyUpdates]
 *     responses:
 *       200:
 *         description: Latest prediction fetched
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal error
 */
router.get("/latestDailyUpdates", getLatestPrediction);

module.exports = router;
