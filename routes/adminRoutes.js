const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin API endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (active + inactive)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', auth, adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/portfolios:
 *   get:
 *     summary: Get all user portfolios
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of portfolios
 */
router.get('/portfolios', auth, adminController.getAllUserPortfolios);

/**
 * @swagger
 * /api/admin/feedbacks:
 *   get:
 *     summary: Get all feedback
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of feedback
 */
router.get('/feedbacks', auth, adminController.getAllFeedback);

module.exports = router;
