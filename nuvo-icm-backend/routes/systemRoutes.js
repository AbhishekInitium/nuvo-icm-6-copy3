
const express = require('express');
const systemController = require('../controllers/systemController');

const router = express.Router();

/**
 * @route   POST /api/system/config
 * @desc    Save system configuration
 * @access  Private/Admin
 */
router.post('/config', systemController.saveSystemConfig);

/**
 * @route   GET /api/system/config
 * @desc    Get system configuration
 * @access  Private/Admin
 */
router.get('/config', systemController.getSystemConfig);

module.exports = router;
