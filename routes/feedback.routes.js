const express = require('express');
const router = express.Router();
const feedbackCtrl = require('../controllers/feedback.controller');
const auth = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Submit user feedback (protected)
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - option
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 5
 *               option:
 *                 type: string
 *                 example: "UX"
 *               message:
 *                 type: string
 *                 example: "Great app, but can improve performance"
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 */
router.post('/', auth, feedbackCtrl.submitFeedback);

module.exports = router;
