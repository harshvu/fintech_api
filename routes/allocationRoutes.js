const express = require("express");
const router = express.Router();
const { allocateBudgetBatch } = require("../controllers/userAllocation");

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
 * /api/user-allocation/ai/analyze/batch:
 *   post:
 *     summary: Run AI analysis for multiple users (Batch)
 *     description: >
 *       Calls AI analyze batch API and stores AI signals user-wise.
 *       If user data already exists, it will be updated; otherwise inserted.
 *     tags:
 *       - AI Analysis
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_ids
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "6880b12dba98cbdd998b5a2a"
 *     responses:
 *       200:
 *         description: AI analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: AI analysis saved successfully
 *                 total_users:
 *                   type: number
 *                   example: 1
 *                 success_count:
 *                   type: number
 *                   example: 1
 *                 failure_count:
 *                   type: number
 *                   example: 0
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/ai/analyze/batch",
  runUserAIAnalysisBatch
);
/**
 * @swagger
 * /api/user-allocation/ai/analyze/batch/user:
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
  "/ai/analyze/batch/user",
  getUserAnalyzeResult
);
module.exports = router;
