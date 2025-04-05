
const KpiConfig = require('../models/KpiConfig');
const { getClientConfig } = require('../utils/clientLoader');

/**
 * @desc    Get all admin configurations for a client
 * @route   GET /api/admin/configs
 * @access  Private
 */
exports.getAllConfigs = async (req, res) => {
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

    const configs = await KpiConfig.find({ clientId });
    
    return res.status(200).json({
      success: true,
      count: configs.length,
      data: configs
    });
    
  } catch (error) {
    console.error('Error fetching admin configurations:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get a single admin configuration by name
 * @route   GET /api/admin/config/:adminName
 * @access  Private
 */
exports.getConfigByName = async (req, res) => {
  try {
    const { adminName } = req.params;
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

    const config = await KpiConfig.findOne({ adminName, clientId });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: `Configuration with name ${adminName} not found for client ${clientId}`
      });
    }

    return res.status(200).json({
      success: true,
      data: config
    });
    
  } catch (error) {
    console.error('Error fetching admin configuration:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Save a new admin configuration
 * @route   POST /api/admin/configs
 * @access  Private
 */
exports.saveConfig = async (req, res) => {
  try {
    const { clientId, adminName } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    if (!adminName) {
      return res.status(400).json({ success: false, error: 'Admin name is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    // Check if a config with this name already exists for this client
    let config = await KpiConfig.findOne({ adminName, clientId });

    if (config) {
      // Update existing config
      config = await KpiConfig.findOneAndUpdate(
        { adminName, clientId }, 
        req.body, 
        { new: true, runValidators: true }
      );
    } else {
      // Create new config
      config = await KpiConfig.create(req.body);
    }

    return res.status(201).json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error saving admin configuration:', error);
    
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
