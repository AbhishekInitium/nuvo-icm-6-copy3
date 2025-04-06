
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

/**
 * @route   POST /api/system/test-connection
 * @desc    Test MongoDB connection
 * @access  Private/Admin
 */
router.post('/test-connection', systemController.testConnection);

/**
 * @route   POST /api/system/set-connection
 * @desc    Set up client MongoDB collections
 * @access  Private/Admin
 */
router.post('/set-connection', systemController.setConnection);

module.exports = router;
