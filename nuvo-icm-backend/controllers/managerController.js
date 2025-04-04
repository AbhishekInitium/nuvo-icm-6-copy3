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
 * @desc    Get scheme by ID
 * @route   GET /api/manager/scheme/:id
 * @access  Private
 */
exports.getSchemeById = async (req, res) => {
  try {
    const { id } = req.params;
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

    const scheme = await Scheme.findOne({ 
      $or: [
        { _id: id },
        { schemeId: id }
      ],
      clientId 
    });
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: scheme
    });
    
  } catch (error) {
    console.error('Error fetching scheme:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Update scheme
 * @route   PUT /api/manager/scheme/:id
 * @access  Private
 */
exports.updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    const scheme = await Scheme.findOne({ 
      $or: [
        { _id: id },
        { schemeId: id }
      ],
      clientId 
    });
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found'
      });
    }
    
    // Only allow updates if scheme is in Draft status
    if (scheme.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        error: 'Only schemes in Draft status can be updated'
      });
    }
    
    // Update the scheme
    const updatedScheme = await Scheme.findByIdAndUpdate(
      scheme._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      data: updatedScheme
    });
    
  } catch (error) {
    console.error('Error updating scheme:', error);
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
 * @desc    Create a new version of a scheme
 * @route   POST /api/manager/scheme/:id/version
 * @access  Private
 */
exports.createSchemeVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    const scheme = await Scheme.findOne({ 
      $or: [
        { _id: id },
        { schemeId: id }
      ],
      clientId 
    });
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: 'Scheme not found'
      });
    }
    
    // Create a new version of the scheme
    const schemeData = scheme.toObject();
    
    // Remove fields that shouldn't be duplicated
    delete schemeData._id;
    delete schemeData.schemeId;
    delete schemeData.status;
    delete schemeData.createdAt;
    delete schemeData.updatedAt;
    delete schemeData.approvalInfo;
    
    // Set version reference and reset to Draft status
    schemeData.versionOf = scheme.schemeId;
    schemeData.status = 'Draft';
    
    // Create the new version
    const newScheme = await Scheme.create(schemeData);
    
    return res.status(201).json({
      success: true,
      data: newScheme
    });
    
  } catch (error) {
    console.error('Error creating scheme version:', error);
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
