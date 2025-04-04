
const express = require('express');
const integrationController = require('../controllers/integrationController');

const router = express.Router();

/**
 * @route   POST /api/integration/config
 * @desc    Save or update system configuration
 * @access  Private
 */
router.post('/config', integrationController.saveSystemConfig);

/**
 * @route   GET /api/integration/config
 * @desc    Get system configuration by client ID
 * @access  Private
 */
router.get('/config', integrationController.getSystemConfig);

module.exports = router;
