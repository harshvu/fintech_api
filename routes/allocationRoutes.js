const express = require("express");
const router = express.Router();
const { allocateBudgetBatch,runUserAIAnalysisBatch,getUserAnalyzeResult } = require("../controllers/userAllocation");

/**
 * @swagger
 * /api/allocation/allocate/batch:
 *   post:
 *     summary: Batch AI allocation for all users
 *     tags: [Allocation]
 *     responses:
 *       200:
 *         description: Batch allocation completed
 *       500:
 *         description: Allocation failed
 */
router.post("/allocate/batch", allocateBudgetBatch);
/**
 * @swagger
 * /api/allocation/analyze/batch:
 *   post:
 *     summary: Run AI batch analysis for all allocated users
 *     tags:
 *       - AI Analysis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI analysis executed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/analyze/batch",
  runUserAIAnalysisBatch
);
/**
 * @swagger
 * /api/allocation/byUser:
 *   get:
 *     summary: Get AI analyze batch result for logged-in user
 *     description: >
 *       Fetches the latest AI analysis result using user ID extracted from JWT token.
 *     tags:
 *       - AI Analysis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User AI analysis fetched successfully
 *       401:
 *         description: Unauthorized or invalid token
 *       404:
 *         description: No analysis found for user
 *       500:
 *         description: Server error
 */
router.get(
  "/byUser",
  getUserAnalyzeResult
);
module.exports = router;
