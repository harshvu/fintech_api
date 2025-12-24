const express = require('express');
const router = express.Router();
const stockCtrl = require('../controllers/stockPortfolio.controller');
const auth = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Portfolio
 *   description: Stock portfolio management
 */

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get all stocks in the user's portfolio
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stocks
 */
router.get('/', auth, stockCtrl.getUserStocks);

/**
 * @swagger
 * /api/portfolio/add:
 *   post:
 *     summary: Add multiple stocks to the user's portfolio
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stocks
 *             properties:
 *               stocks:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["stock1", "stock2", "stock3"]
 *     responses:
 *       201:
 *         description: Stocks added to portfolio
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized (no or invalid token)
 *       500:
 *         description: Server error
 */
router.post('/add', auth, stockCtrl.addStocksToPortfolio);
/**
 * @swagger
 * /api/portfolio/{id}:
 *   delete:
 *     summary: Delete a stock from the user's portfolio by ID
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The stock ID to delete
 *     responses:
 *       200:
 *         description: Stock deleted successfully
 *       404:
 *         description: Stock not found
 */
router.delete('/:id', auth, stockCtrl.deleteStockById);
/**
 * @swagger
 * /api/portfolio/update-budget:
 *   put:
 *     summary: Update logged-in user's budget
 *     description: Update total budget using JWT token
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - total_budget
 *             properties:
 *               total_budget:
 *                 type: number
 *                 example: 10000
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  "/update-budget",
  auth,
  stockCtrl.updateUserBudget
);

module.exports = router;
