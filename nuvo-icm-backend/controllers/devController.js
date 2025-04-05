
/**
 * Controller for development-related endpoints
 */

/**
 * @desc    Get all registered routes in the Express app
 * @route   GET /api/dev/routes
 * @access  Development only
 */
exports.getAllRoutes = (app) => async (req, res) => {
  try {
    const routes = [];
    
    // Function to extract routes from a layer
    const extractRoutes = (layer, basePath = '') => {
      if (layer.route) {
        // This is a route layer
        const path = basePath + (layer.route.path || '');
        const methods = Object.keys(layer.route.methods)
          .filter(method => layer.route.methods[method])
          .map(method => method.toUpperCase());
        
        routes.push({
          path,
          methods
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // This is a router middleware
        const routerPath = basePath + (layer.regexp.source
          .replace('^\\/','/')
          .replace('\\/?(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ':param'));
          
        layer.handle.stack.forEach(stackItem => {
          extractRoutes(stackItem, routerPath);
        });
      } else if (layer.name !== 'expressInit' && layer.name !== 'query' && layer.name !== 'checkMongoHealth') {
        // Skip internal Express middleware
        if (layer.handle && layer.handle.stack) {
          layer.handle.stack.forEach(stackItem => {
            extractRoutes(stackItem, basePath);
          });
        }
      }
    };

    // Loop through all layers in the main stack
    app._router.stack.forEach(layer => {
      extractRoutes(layer);
    });

    // Sort routes alphabetically by path
    routes.sort((a, b) => a.path.localeCompare(b.path));

    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
