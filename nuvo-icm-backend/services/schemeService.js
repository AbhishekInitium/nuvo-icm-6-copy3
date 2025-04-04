
const Scheme = require('../models/Scheme');
const { getClientConfig } = require('../utils/clientLoader');

/**
 * Get all non-draft schemes for a client
 * @param {string} clientId - The ID of the client
 * @returns {Promise<Array>} - Array of schemes
 */
exports.getApprovedSchemes = async (clientId) => {
  if (!clientId) {
    throw new Error('Client ID is required');
  }

  // Validate clientId using the clientLoader
  getClientConfig(clientId);

  // Find all schemes for this client that are not in DRAFT status
  const schemes = await Scheme.find({ 
    clientId, 
    status: { $ne: 'Draft' } 
  });
  
  return schemes;
};

/**
 * Approve a scheme (change status from DRAFT to APPROVED)
 * @param {string} schemeId - The ID of the scheme
 * @param {string} clientId - The ID of the client
 * @param {string} notes - Approval notes
 * @returns {Promise<Object>} - The updated scheme
 */
exports.approveScheme = async (schemeId, clientId, notes) => {
  if (!clientId) {
    throw new Error('Client ID is required');
  }

  // Validate clientId using the clientLoader
  getClientConfig(clientId);

  // Find the scheme
  const scheme = await Scheme.findOne({ schemeId, clientId });
  
  if (!scheme) {
    throw new Error(`Scheme with ID ${schemeId} not found for client ${clientId}`);
  }

  // Check if the scheme is in DRAFT status
  if (scheme.status !== 'Draft') {
    throw new Error(`Scheme must be in DRAFT status to be approved. Current status: ${scheme.status}`);
  }

  // Update the scheme status to APPROVED
  scheme.status = 'Approved';
  
  // Log approval info (in a real implementation, this would come from auth middleware)
  scheme.approvalInfo = {
    approvedAt: new Date(),
    approvedBy: 'ops-user@example.com', // Mock user for now
    notes: notes || 'Approved by Operations'
  };
  
  // Save the updated scheme
  await scheme.save();
  
  return scheme;
};
