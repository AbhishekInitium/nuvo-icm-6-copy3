
const { getClientConfig } = require('../utils/clientLoader');

/**
 * Health check controller
 */
exports.healthCheck = (req, res) => {
  const baseResponse = {
    status: 'success',
    message: 'API is healthy and running',
    timestamp: new Date()
  };

  // Check if clientId is provided in query parameters
  if (req.query.clientId) {
    try {
      const clientConfig = getClientConfig(req.query.clientId);
      console.log(`Client config loaded for clientId: ${req.query.clientId}`);
      
      // Return response with client info (excluding sensitive data)
      return res.status(200).json({
        ...baseResponse,
        client: {
          clientId: clientConfig.clientId,
          sapSystemId: clientConfig.sapSystemId,
          mongoCollectionsPrefix: clientConfig.mongoCollectionsPrefix
        }
      });
    } catch (error) {
      console.error(`Error loading client configuration: ${error.message}`);
      return res.status(400).json({
        status: 'error',
        message: error.message,
        timestamp: new Date()
      });
    }
  }

  // If no clientId provided, return basic health check
  res.status(200).json(baseResponse);
};
