
const SystemConfig = require('../models/SystemConfig');
const { getClientConfig } = require('../utils/clientLoader');

/**
 * @desc    Save or update system configuration
 * @route   POST /api/integration/config
 * @access  Private
 */
exports.saveSystemConfig = async (req, res) => {
  try {
    const { 
      clientId, 
      sapSystemId, 
      sapBaseUrl, 
      sapDestinationName, 
      sapUsername, 
      sapPassword,
      defaultCurrency,
      kpiApiMappings 
    } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }

    // Validate clientId using clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    // Check if configuration already exists
    let systemConfig = await SystemConfig.findOne({ clientId });

    if (systemConfig) {
      // Update existing configuration
      systemConfig = await SystemConfig.findOneAndUpdate(
        { clientId },
        { 
          sapSystemId, 
          sapBaseUrl, 
          sapDestinationName, 
          sapUsername, 
          sapPassword,
          defaultCurrency,
          kpiApiMappings 
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new configuration
      systemConfig = await SystemConfig.create({
        clientId,
        sapSystemId,
        sapBaseUrl,
        sapDestinationName,
        sapUsername,
        sapPassword,
        defaultCurrency,
        kpiApiMappings
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        clientId: systemConfig.clientId,
        sapSystemId: systemConfig.sapSystemId,
        sapBaseUrl: systemConfig.sapBaseUrl,
        sapDestinationName: systemConfig.sapDestinationName,
        sapUsername: systemConfig.sapUsername,
        // Don't return the password
        defaultCurrency: systemConfig.defaultCurrency,
        kpiApiMappings: systemConfig.kpiApiMappings,
        createdAt: systemConfig.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving system configuration:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get system configuration by client ID
 * @route   GET /api/integration/config?clientId=xxx
 * @access  Private
 */
exports.getSystemConfig = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }

    // Validate clientId using clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    const systemConfig = await SystemConfig.findOne({ clientId });

    if (!systemConfig) {
      return res.status(404).json({
        success: false,
        error: `System configuration not found for client ${clientId}`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        clientId: systemConfig.clientId,
        sapSystemId: systemConfig.sapSystemId,
        sapBaseUrl: systemConfig.sapBaseUrl,
        sapDestinationName: systemConfig.sapDestinationName,
        sapUsername: systemConfig.sapUsername,
        // Don't return the password
        defaultCurrency: systemConfig.defaultCurrency,
        kpiApiMappings: systemConfig.kpiApiMappings,
        createdAt: systemConfig.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching system configuration:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
