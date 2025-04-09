
const mongoose = require('mongoose');
const SystemConfig = require('../models/SystemConfig');
const MasterConfig = require('../models/MasterConfig');
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

    // Get the master configuration for this client
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    if (!masterConfig || !masterConfig.setupComplete) {
      return res.status(400).json({
        success: false,
        error: 'Client database setup is not complete. Please set up the connection first.'
      });
    }

    // Connect to the client's database
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

    // Create a model for the client's system config collection
    // IMPORTANT: Use the clientDbConnection to ensure we're not creating in master DB
    const ClientSystemConfig = clientDbConnection.model('SystemConfig', 
      new mongoose.Schema({
        clientId: String,
        ...SystemConfig.schema.obj // Copy fields from our main SystemConfig schema
      }), 
      masterConfig.collections.systemconfigs // Use the collection name from masterConfig
    );

    // Check if configuration already exists
    let systemConfig = await ClientSystemConfig.findOne({ clientId });

    if (systemConfig) {
      // Update existing configuration
      systemConfig = await ClientSystemConfig.findOneAndUpdate(
        { clientId },
        { 
          kpiApiMappings 
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new configuration
      systemConfig = await ClientSystemConfig.create({
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

    // Get the master configuration for this client
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    if (!masterConfig || !masterConfig.setupComplete) {
      return res.status(404).json({
        success: false,
        error: `Client database setup is not complete for client: ${clientId}`
      });
    }

    // Connect to the client's database
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

    // Create a model for the client's system config collection
    // IMPORTANT: Use the clientDbConnection to ensure we're querying the client DB, not master
    const ClientSystemConfig = clientDbConnection.model('SystemConfig', 
      new mongoose.Schema({
        clientId: String,
        ...SystemConfig.schema.obj // Copy fields from our main SystemConfig schema
      }), 
      masterConfig.collections.systemconfigs // Use the collection name from masterConfig
    );

    const systemConfig = await ClientSystemConfig.findOne({ clientId });

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
