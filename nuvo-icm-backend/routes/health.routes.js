
const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

// Health check route
router.get('/health', healthController.healthCheck);

module.exports = router;
