
const express = require('express');
const agentController = require('../controllers/agentController');

const router = express.Router();

/**
 * @route   GET /api/agent/schemes
 * @desc    Get list of schemes where the agent has participated
 * @access  Private
 */
router.get('/schemes', agentController.getAgentSchemes);

/**
 * @route   GET /api/agent/scheme/:schemeId/result
 * @desc    Get agent-specific result from the most recent execution log
 * @access  Private
 */
router.get('/scheme/:schemeId/result', agentController.getAgentResultForScheme);

module.exports = router;
