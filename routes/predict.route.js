const express = require("express");
const router = express.Router();
const { predictStocks } = require("../controllers/predictController");

/**
 * @swagger
 * tags:
 *   name: Predict
 *   description: AI Prediction for Stocks
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

module.exports = router;
