
const express = require('express');
const adminConfigController = require('../controllers/adminConfigController');

const router = express.Router();

/**
 * @route   GET /api/admin/configs
 * @desc    Get all admin configurations for a client
 * @access  Private
 */
router.get('/configs', adminConfigController.getAllConfigs);

/**
 * @route   GET /api/admin/config/:adminName
 * @desc    Get a single admin configuration by name
 * @access  Private
 */
router.get('/config/:adminName', adminConfigController.getConfigByName);

/**
 * @route   POST /api/admin/configs
 * @desc    Save a new admin configuration
 * @access  Private
 */
router.post('/configs', adminConfigController.saveConfig);

module.exports = router;
