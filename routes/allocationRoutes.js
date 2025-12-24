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

module.exports = router;
