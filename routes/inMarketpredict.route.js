const express = require("express");
const router = express.Router();
const { predictStocks,getLatestPrediction } = require("../controllers/predictControllerIn");

/**
 * @swagger
 * tags:
 *   name: PredictIn
 *   description: AI Prediction for Stocks
 */

/**
 * @swagger
 * /api/predictIn:
 *   post:
 *     summary: Trigger AI prediction per user (no auth)
 *     tags: [PredictIn]
 *     responses:
 *       200:
 *         description: Prediction success
 *       500:
 *         description: Internal error
 */
router.post("/", predictStocks);

/**
 * @swagger
 * /api/predicton/latest:
 *   get:
 *     summary: Get latest AI prediction per user
 *     tags: [Predictin]
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
