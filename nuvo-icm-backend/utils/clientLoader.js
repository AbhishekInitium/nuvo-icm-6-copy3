
/**
 * Client loader utility
 * Loads client configuration based on clientId
 */

const clients = require('../config/clients');

/**
 * Get client configuration by clientId
 * @param {string} clientId - The client identifier
 * @returns {Object} Client configuration object
 * @throws {Error} If client configuration is not found
 */
function getClientConfig(clientId) {
  if (!clientId) {
    throw new Error('ClientId is required');
  }

  const clientConfig = clients.find(client => client.clientId === clientId);
  
  if (!clientConfig) {
    throw new Error(`Client configuration not found for clientId: ${clientId}`);
  }
  
  return clientConfig;
}

module.exports = {
  getClientConfig
};
