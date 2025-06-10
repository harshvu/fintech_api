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

module.exports = router;
