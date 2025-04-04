
const express = require('express');
const opsController = require('../controllers/opsController');

const router = express.Router();

/**
 * @route   GET /api/ops/schemes
 * @desc    List all schemes for the client that are not in DRAFT
 * @access  Private
 */
router.get('/schemes', opsController.getApprovedSchemes);

/**
 * @route   PUT /api/ops/scheme/:schemeId/approve
 * @desc    Mark a scheme as APPROVED. Only allowed if current status is DRAFT
 * @access  Private
 */
router.put('/scheme/:schemeId/approve', opsController.approveScheme);

/**
 * @route   GET /api/ops/production-runs
 * @desc    List all production execution logs for this client
 * @access  Private
 */
router.get('/production-runs', opsController.getProductionRuns);

/**
 * @route   GET /api/ops/production-run/:runId
 * @desc    Get full run result with summary and per-agent logs
 * @access  Private
 */
router.get('/production-run/:runId', opsController.getProductionRunDetail);

module.exports = router;
