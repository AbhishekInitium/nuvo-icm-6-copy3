
const Scheme = require('../models/Scheme');
const KpiConfig = require('../models/KpiConfig');
const { getClientConfig } = require('../utils/clientLoader');

/**
 * @desc    Create a new incentive scheme
 * @route   POST /api/manager/schemes
 * @access  Private
 */
exports.createScheme = async (req, res) => {
  try {
    const { clientId, configName } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    // Verify that the configName exists in KpiConfig
    const configExists = await KpiConfig.findOne({ adminName: configName, clientId });
    if (!configExists) {
      return res.status(404).json({
        success: false,
        error: `Configuration with name "${configName}" not found. Please select a valid configuration.`
      });
    }

    // Create the scheme
    const scheme = await Scheme.create(req.body);
    
    return res.status(201).json({
      success: true,
      data: scheme
    });

  } catch (error) {
    console.error('Error creating scheme:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get all schemes for a client
 * @route   GET /api/manager/schemes
 * @access  Private
 */
exports.getAllSchemes = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    const schemes = await Scheme.find({ clientId });
    
    return res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes
    });
    
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get available configurations for scheme creation
 * @route   GET /api/manager/available-configs
 * @access  Private
 */
exports.getAvailableConfigs = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    // Get all available configs for this client
    const configs = await KpiConfig.find({ clientId }).select('adminName calculationBase');
    
    return res.status(200).json({
      success: true,
      count: configs.length,
      data: configs
    });
    
  } catch (error) {
    console.error('Error fetching available configurations:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
