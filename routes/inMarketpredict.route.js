const express = require("express");
const router = express.Router();
const { predictStocks } = require("../controllers/predictControllerIn");

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

module.exports = router;
