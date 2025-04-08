
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user
 * @access  Public
 */
router.post('/login', authController.login);

module.exports = router;
