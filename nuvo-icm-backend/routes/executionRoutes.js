
const express = require('express');
const executionController = require('../controllers/executionController');

const router = express.Router();

/**
 * @route   POST /api/execute/run
 * @desc    Run a scheme in simulation or production mode
 * @access  Private
 */
router.post('/run', executionController.runScheme);

/**
 * @route   GET /api/execute/logs
 * @desc    Get all execution logs for a client
 * @access  Private
 */
router.get('/logs', executionController.getAllExecutionLogs);

/**
 * @route   GET /api/execute/log/:runId
 * @desc    Get a single execution log by runId
 * @access  Private
 */
router.get('/log/:runId', executionController.getExecutionLogById);

module.exports = router;
