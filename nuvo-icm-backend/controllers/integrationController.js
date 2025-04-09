
const SystemConfig = require('../models/SystemConfig');
const KpiConfig = require('../models/KpiConfig');
const MasterConfig = require('../models/MasterConfig');
const { getClientConfig } = require('../utils/clientLoader');
const { connectClientDb } = require('../utils/clientConnection');

/**
 * @desc    Save or update system configuration
 * @route   POST /api/integration/config
 * @access  Private
 */
exports.saveSystemConfig = async (req, res) => {
  try {
    const { 
      clientId, 
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

    // Check if configuration already exists in master database
    let systemConfig = await SystemConfig.findOne({ clientId });

    if (systemConfig) {
      // Update existing configuration in master database
      systemConfig = await SystemConfig.findOneAndUpdate(
        { clientId },
        { 
          kpiApiMappings 
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new configuration in master database
      systemConfig = await SystemConfig.create({
        clientId,
        kpiApiMappings
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        clientId: systemConfig.clientId,
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

/**
 * @desc    Save KPI configuration to client database 
 * @route   POST /api/integration/kpi-config
 * @access  Private
 */
exports.saveKpiConfig = async (req, res) => {
  try {
    const { 
      clientId,
      adminId,
      adminName,
      calculationBase,
      baseField,
      baseData,
      qualificationFields,
      adjustmentFields,
      exclusionFields,
      customRules
    } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }

    // Get master config to check if client DB setup is complete
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    if (!masterConfig || !masterConfig.setupComplete) {
      return res.status(400).json({
        success: false,
        error: 'Client database setup is not complete. Please set up the connection first.'
      });
    }

    // Connect to client database
    let clientDbConnection;
    try {
      clientDbConnection = await connectClientDb(clientId);
    } catch (connectionError) {
      console.error('MongoDB connection failed:', connectionError);
      return res.status(500).json({
        success: false,
        error: `Failed to connect to client database: ${connectionError.message}`
      });
    }

    // Create a model for the client's KPI config collection
    // Use the non-prefixed collection name
    const ClientKpiConfig = clientDbConnection.model('KpiConfig', 
      KpiConfig.schema, 
      masterConfig.collections.kpiconfigs
    );

    // Check if KPI config with the same adminName already exists
    let kpiConfig = await ClientKpiConfig.findOne({ 
      adminName,
      clientId
    });

    if (kpiConfig) {
      // Update existing config
      kpiConfig = await ClientKpiConfig.findOneAndUpdate(
        { adminName, clientId },
        { 
          adminId,
          calculationBase,
          baseField,
          baseData,
          qualificationFields,
          adjustmentFields,
          exclusionFields,
          customRules
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new config
      kpiConfig = await ClientKpiConfig.create({
        adminId,
        adminName,
        calculationBase,
        baseField,
        baseData,
        qualificationFields,
        adjustmentFields,
        exclusionFields,
        customRules,
        clientId
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'KPI configuration saved successfully',
      data: {
        id: kpiConfig._id,
        adminName: kpiConfig.adminName,
        clientId: kpiConfig.clientId
      }
    });
  } catch (error) {
    console.error('Error saving KPI configuration:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

/**
 * @desc    Get KPI configurations for a client
 * @route   GET /api/integration/kpi-configs?clientId=xxx
 * @access  Private
 */
exports.getKpiConfigs = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }

    // Get master config to check if client DB setup is complete
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    if (!masterConfig || !masterConfig.setupComplete) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Client database setup is not complete'
      });
    }

    // Connect to client database
    let clientDbConnection;
    try {
      clientDbConnection = await connectClientDb(clientId);
    } catch (connectionError) {
      console.error('MongoDB connection failed:', connectionError);
      return res.status(500).json({
        success: false,
        error: `Failed to connect to client database: ${connectionError.message}`
      });
    }

    // Create a model for the client's KPI config collection
    // Use the non-prefixed collection name
    const ClientKpiConfig = clientDbConnection.model('KpiConfig', 
      KpiConfig.schema, 
      masterConfig.collections.kpiconfigs
    );

    // Fetch all KPI configs for this client
    const kpiConfigs = await ClientKpiConfig.find({ clientId });

    // Return the results
    return res.status(200).json({
      success: true,
      data: kpiConfigs
    });
  } catch (error) {
    console.error('Error fetching KPI configurations:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

/**
 * @desc    Get a specific KPI configuration by ID
 * @route   GET /api/integration/kpi-config/:id?clientId=xxx
 * @access  Private
 */
exports.getKpiConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }

    // Get master config to check if client DB setup is complete
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    if (!masterConfig || !masterConfig.setupComplete) {
      return res.status(404).json({
        success: false,
        error: 'Client database setup is not complete'
      });
    }

    // Connect to client database
    let clientDbConnection;
    try {
      clientDbConnection = await connectClientDb(clientId);
    } catch (connectionError) {
      console.error('MongoDB connection failed:', connectionError);
      return res.status(500).json({
        success: false,
        error: `Failed to connect to client database: ${connectionError.message}`
      });
    }

    // Create a model for the client's KPI config collection
    // Use the non-prefixed collection name
    const ClientKpiConfig = clientDbConnection.model('KpiConfig', 
      KpiConfig.schema, 
      masterConfig.collections.kpiconfigs
    );

    // Find the KPI config by ID
    const kpiConfig = await ClientKpiConfig.findById(id);

    if (!kpiConfig) {
      return res.status(404).json({
        success: false,
        error: 'KPI configuration not found'
      });
    }

    // Return the KPI config
    return res.status(200).json({
      success: true,
      data: kpiConfig
    });
  } catch (error) {
    console.error('Error fetching KPI configuration:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

/**
 * @desc    Delete a KPI configuration
 * @route   DELETE /api/integration/kpi-config/:id?clientId=xxx
 * @access  Private
 */
exports.deleteKpiConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }

    // Get master config to check if client DB setup is complete
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    if (!masterConfig || !masterConfig.setupComplete) {
      return res.status(404).json({
        success: false,
        error: 'Client database setup is not complete'
      });
    }

    // Connect to client database
    let clientDbConnection;
    try {
      clientDbConnection = await connectClientDb(clientId);
    } catch (connectionError) {
      console.error('MongoDB connection failed:', connectionError);
      return res.status(500).json({
        success: false,
        error: `Failed to connect to client database: ${connectionError.message}`
      });
    }

    // Create a model for the client's KPI config collection
    // Use the non-prefixed collection name
    const ClientKpiConfig = clientDbConnection.model('KpiConfig', 
      KpiConfig.schema, 
      masterConfig.collections.kpiconfigs
    );

    // Find and delete the KPI config
    const kpiConfig = await ClientKpiConfig.findByIdAndDelete(id);

    if (!kpiConfig) {
      return res.status(404).json({
        success: false,
        error: 'KPI configuration not found'
      });
    }

    // Return success
    return res.status(200).json({
      success: true,
      message: 'KPI configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting KPI configuration:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};
