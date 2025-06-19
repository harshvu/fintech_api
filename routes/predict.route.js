const express = require("express");
const router = express.Router();
const { predictStocks, getLatestPrediction } = require("../controllers/predictController");
const auth = require("../middlewares/auth.middleware");
/**
 * @swagger
 * tags:
 *   name: Pre Market Predict
 *   description: AI Prediction For Pre Market Stocks
 */

/**
 * @swagger
 * /api/predict:
 *   post:
 *     summary: Trigger AI prediction per user (no auth)
 *     tags: [Predict]
 *     responses:
 *       200:
 *         description: Prediction success
 *       500:
 *         description: Internal error
 */
router.post("/", predictStocks);

/**
 * @swagger
 * /api/predict/latest:
 *   get:
 *     summary: Get latest AI prediction per user
 *     tags: [Predict]
 *     responses:
 *       200:
 *         description: Latest predictions fetched
 *       404:
 *         description: No predictions found
 *       500:
 *         description: Internal error
 */
router.get("/latest", auth, getLatestPrediction);

module.exports = router;
