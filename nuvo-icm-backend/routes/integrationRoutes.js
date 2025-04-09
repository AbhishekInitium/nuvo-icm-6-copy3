
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

/**
 * @route   POST /api/integration/kpi-config
 * @desc    Save KPI configuration to client database
 * @access  Private
 */
router.post('/kpi-config', integrationController.saveKpiConfig);

/**
 * @route   GET /api/integration/kpi-configs
 * @desc    Get all KPI configurations for a client
 * @access  Private
 */
router.get('/kpi-configs', integrationController.getKpiConfigs);

/**
 * @route   GET /api/integration/kpi-config/:id
 * @desc    Get KPI configuration by ID
 * @access  Private
 */
router.get('/kpi-config/:id', integrationController.getKpiConfigById);

/**
 * @route   DELETE /api/integration/kpi-config/:id
 * @desc    Delete KPI configuration
 * @access  Private
 */
router.delete('/kpi-config/:id', integrationController.deleteKpiConfig);

module.exports = router;
