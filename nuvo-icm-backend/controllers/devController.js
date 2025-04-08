
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
    
    // Get server protocol and host info from request
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
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
          fullUrl: `${baseUrl}${path}`,
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

    // Create a summary that groups by main route section
    const routeSummary = {};
    routes.forEach(route => {
      const section = route.path.split('/')[1] || 'root';
      if (!routeSummary[section]) {
        routeSummary[section] = [];
      }
      routeSummary[section].push({
        path: route.path,
        fullUrl: route.fullUrl,
        methods: route.methods
      });
    });

    res.status(200).json({
      success: true,
      baseUrl: baseUrl,
      count: routes.length,
      summary: routeSummary,
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

/**
 * @desc    Get a detailed documentation of API endpoints
 * @route   GET /api/dev/docs
 * @access  Development only
 */
exports.getApiDocs = (app) => async (req, res) => {
  try {
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    // Example request and response for each route
    const docs = {
      baseUrl: baseUrl,
      endpoints: {
        health: {
          url: `${baseUrl}/api/health`,
          method: 'GET',
          description: 'Check if the server is running',
          response: { success: true, status: 'ok' }
        },
        auth: {
          login: {
            url: `${baseUrl}/api/auth/login`,
            method: 'POST',
            description: 'Authenticate a user',
            request: { username: 'user@example.com', role: 'manager', clientId: 'client_001' },
            response: { success: true, user: { username: 'user@example.com', role: 'manager', clientId: 'client_001' } }
          }
        },
        manager: {
          getSchemes: {
            url: `${baseUrl}/api/manager/schemes`,
            method: 'GET',
            description: 'Get all schemes for a client',
            params: { clientId: 'client_001' },
            response: { success: true, data: [] }
          },
          createScheme: {
            url: `${baseUrl}/api/manager/schemes`,
            method: 'POST',
            description: 'Create a new incentive scheme',
            request: { name: 'New Scheme', description: 'Test scheme', clientId: 'client_001' },
            response: { success: true, data: { id: 'scheme123', name: 'New Scheme' } }
          }
        },
        // Add more documentation for other routes...
      }
    };
    
    res.status(200).json({
      success: true,
      data: docs
    });
  } catch (error) {
    console.error('Error generating API docs:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

