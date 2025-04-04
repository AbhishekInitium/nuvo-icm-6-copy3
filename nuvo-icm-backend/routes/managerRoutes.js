
const express = require('express');
const managerController = require('../controllers/managerController');

const router = express.Router();

/**
 * @route   POST /api/manager/schemes
 * @desc    Create a new incentive scheme
 * @access  Private
 */
router.post('/schemes', managerController.createScheme);

/**
 * @route   GET /api/manager/schemes
 * @desc    Get all schemes for a client
 * @access  Private
 */
router.get('/schemes', managerController.getAllSchemes);

/**
 * @route   GET /api/manager/scheme/:id
 * @desc    Get a specific scheme by ID
 * @access  Private
 */
router.get('/scheme/:id', managerController.getSchemeById);

/**
 * @route   PUT /api/manager/scheme/:id
 * @desc    Update a scheme
 * @access  Private
 */
router.put('/scheme/:id', managerController.updateScheme);

/**
 * @route   POST /api/manager/scheme/:id/version
 * @desc    Create a new version of a scheme
 * @access  Private
 */
router.post('/scheme/:id/version', managerController.createSchemeVersion);

/**
 * @route   GET /api/manager/available-configs
 * @desc    Get available configurations for scheme creation
 * @access  Private
 */
router.get('/available-configs', managerController.getAvailableConfigs);

module.exports = router;
