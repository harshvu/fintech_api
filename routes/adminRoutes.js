const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require("../middlewares/auth.middleware");
/**
 * @route GET /api/admin/users
 * @desc Get all users
 * @access Admin
 */
router.get('/users', auth,adminController.getAllUsers);

/**
 * @route GET /api/admin/portfolios
 * @desc Get all user portfolios
 * @access Admin
 */
router.get('/portfolios', auth,adminController.getAllUserPortfolios);

/**
 * @route GET /api/admin/feedbacks
 * @desc Get all feedback
 * @access Admin
 */
router.get('/feedbacks',auth, adminController.getAllFeedback);

module.exports = router;
