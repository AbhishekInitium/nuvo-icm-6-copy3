
const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

// Health check route
router.get('/health', healthController.healthCheck);

// System diagnostics route
router.get('/system/diagnostics', healthController.systemDiagnostics);

module.exports = router;
