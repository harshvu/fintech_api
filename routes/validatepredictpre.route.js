const express = require("express");
const router = express.Router();
const { validatepredictStocks, getLatestPrediction } = require("../controllers/validatepredictController");
const auth = require("../middlewares/auth.middleware");
/**
 * @swagger
 * tags:
 *   name: AI validation For Pre Market Stocks
 *   description: AI validation Prediction For Pre Market Stocks
 */

/**
 * @swagger
 * /api/validatepredictpre:
 *   post:
 *     summary: Trigger AI prediction per user (no auth)
 *     tags: [AI validation Prediction For Pre Market Stocks]
 *     responses:
 *       200:
 *         description: Prediction success
 *       500:
 *         description: Internal error
 */
router.post("/", validatepredictStocks);

/**
 * @swagger
 * /api/validatepredictpre/latest:
 *   get:
 *     summary: Get latest validation AI prediction per user
 *     tags: [AI validation Prediction For Pre Market Stocks]
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
