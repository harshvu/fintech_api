const express = require("express");
const router = express.Router();
const {
  validatepredictStocks,
  getSummaryByUser
} = require("../controllers/validatepredictInController");
const auth = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: AI validation For Pre Market Stocks
 *   description: AI validation Prediction For IN Market Stocks
 */

/**
 * @swagger
 * /api/validatepredictIn:
 *   post:
 *     summary: Trigger AI prediction per user (no auth)
 *     tags: [AI validation Prediction For IN Market Stocks]
 *     responses:
 *       200:
 *         description: Prediction success
 *       500:
 *         description: Internal error
 */
router.post("/", validatepredictStocks);

/**
 * @swagger
 * /api/validatepredictIn/validate_summary_in:
 *   get:
 *     summary: Get latest validation AI prediction per user
 *     tags: [AI validation Prediction For IN Market Stocks]
 *     responses:
 *       200:
 *         description: Latest predictions fetched
 *       404:
 *         description: No predictions found
 *       500:
 *         description: Internal error
 */
router.get("/validate_summary_in", auth, getSummaryByUser);



module.exports = router;
