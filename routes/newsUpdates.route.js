const express = require("express");
const router = express.Router();
const { predictStocks ,getLatestPrediction } = require("../controllers/newsUpdatesController");

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
 *     tags: [NewsUpdates]
 *     responses:
 *       200:
 *         description: NewsUpdates success
 *       500:
 *         description: Internal error
 */
router.post("/", predictStocks);
/**
 * @swagger
 * /api/newsUpdates/latestnewsUpdates:
 *   get:
 *     summary: Get latest AI prediction
 *     tags: [NewsUpdates]
 *     responses:
 *       200:
 *         description: Latest prediction fetched
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal error
 */
router.get("/latestnewsUpdates", getLatestPrediction);
module.exports = router;
