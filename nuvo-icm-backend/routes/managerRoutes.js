
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

module.exports = router;
