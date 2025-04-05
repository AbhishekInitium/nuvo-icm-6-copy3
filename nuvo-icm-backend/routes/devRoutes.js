
const express = require('express');
const router = express.Router();
const devController = require('../controllers/devController');

/**
 * @route   GET /api/dev/routes
 * @desc    Get all registered routes
 * @access  Development only
 */
// The controller needs access to the Express app instance, which will be provided when mounting the route
const setupRoutes = (app) => {
  router.get('/routes', devController.getAllRoutes(app));
  return router;
};

module.exports = setupRoutes;
