const express = require("express");
const router = express.Router();
const { trainStocks } = require("../controllers/trainController");
const auth = require("../middlewares/auth.middleware"); // Add auth if required

/**
 * @swagger
 * tags:
 *   name: Train
 *   description: Train AI model on stock portfolio
 */

/**
 * @swagger
 * /api/train:
 *   post:
 *     summary: Train AI model with unique stock names from portfolio
 *     tags: [Train]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Training completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Training successful
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post("/", trainStocks); // POST /api/train

module.exports = router;
