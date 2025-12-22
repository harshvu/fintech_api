const express = require("express");
const router = express.Router();
const { allocateBudget } = require("../controllers/userAllocation");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/allocation/allocate:
 *   post:
 *     summary: Allocate user budget into stocks using AI
 *     description: |
 *       Generates stock allocation using AI based on user's total_budget
 *       stored in users table and user's stock portfolio.
 *     tags:
 *       - Allocation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Allocation generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Allocation generated & saved
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 65cddfa94c7a2a0012b32abc
 *                     userId:
 *                       type: string
 *                     allocation_date:
 *                       type: string
 *                       example: 2025-12-22
 *                     total_budget:
 *                       type: number
 *                       example: 10000
 *                     risk_profile:
 *                       type: string
 *                       example: moderate
 *                     allocation_method:
 *                       type: string
 *                       example: hybrid
 *                     stock_allocations:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           amount:
 *                             type: number
 *                             example: 750
 *                           percentage:
 *                             type: number
 *                             example: 7.5
 *                           category:
 *                             type: string
 *                             example: intraday
 *                           current_price:
 *                             type: number
 *                             example: 352.65
 *                           approximate_shares:
 *                             type: number
 *                             example: 2
 *       400:
 *         description: Bad request (budget not configured or no stocks)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User budget not configured
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Allocation failed
 */
router.post("/save", authMiddleware, allocateBudget);

module.exports = router;
