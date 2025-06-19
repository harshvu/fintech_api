const express = require("express");
const router = express.Router();
const { predictStocks,getLatestPrediction } = require("../controllers/predictControllerIn");
const auth = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name:  Live Market Stock Prediction
 *   description: AI Prediction for Live Stocks
 */

/**
 * @swagger
 * /api/predictIn:
 *   post:
 *     summary: Trigger AI prediction per user (no auth)
 *     tags: [Live Market Stock Prediction]
 *     responses:
 *       200:
 *         description: Prediction success
 *       500:
 *         description: Internal error
 */
router.post("/", predictStocks);

/**
 * @swagger
 * /api/predictIn/latest:
 *   get:
 *     summary: Get latest AI prediction per user
 *     tags: [Live Market Stock Prediction]
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
