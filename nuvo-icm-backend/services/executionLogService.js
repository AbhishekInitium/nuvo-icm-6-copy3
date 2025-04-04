
const ExecutionLog = require('../models/ExecutionLog');
const Scheme = require('../models/Scheme');
const { getClientConfig } = require('../utils/clientLoader');

/**
 * Get all production execution logs for a client
 * @param {string} clientId - The ID of the client
 * @returns {Promise<Array>} - Array of production runs
 */
exports.getProductionRuns = async (clientId) => {
  if (!clientId) {
    throw new Error('Client ID is required');
  }

  // Validate clientId using the clientLoader
  getClientConfig(clientId);

  // Find all production execution logs for this client
  const productionRuns = await ExecutionLog.find({ 
    clientId, 
    mode: 'production' 
  }).select('runId schemeId executedAt summary postProcessingLog');
  
  return productionRuns;
};

/**
 * Get detailed execution log for a specific production run
 * @param {string} runId - The ID of the production run
 * @param {string} clientId - The ID of the client
 * @returns {Promise<Object>} - The production run with scheme info
 */
exports.getProductionRunDetail = async (runId, clientId) => {
  if (!clientId) {
    throw new Error('Client ID is required');
  }

  // Validate clientId using the clientLoader
  getClientConfig(clientId);

  // Find the production run
  const productionRun = await ExecutionLog.findOne({ 
    runId, 
    clientId,
    mode: 'production'
  });
  
  if (!productionRun) {
    throw new Error(`Production run with ID ${runId} not found for client ${clientId}`);
  }
  
  // Get the associated scheme data
  const scheme = await Scheme.findOne({ 
    schemeId: productionRun.schemeId, 
    clientId 
  });
  
  return {
    executionLog: productionRun,
    schemeInfo: scheme ? {
      name: scheme.name,
      description: scheme.description,
      effectiveStart: scheme.effectiveStart,
      effectiveEnd: scheme.effectiveEnd,
      quotaAmount: scheme.quotaAmount,
      revenueBase: scheme.revenueBase,
      configName: scheme.configName
    } : null
  };
};
