
const mongoose = require('mongoose');
const MasterConfig = require('../models/MasterConfig');
const SystemConfig = require('../models/SystemConfig');
const { connectClientDb } = require('../utils/clientConnection');

/**
 * @desc    Get system configuration
 * @route   GET /api/system/config
 * @access  Private/Admin
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
      return res.status(200).json({
        success: true,
        data: null,
        setupComplete: false,
        message: 'Client database setup is not complete'
      });
    }

    // Connect to the client's database using our new utility
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
    // Use the non-prefixed collection name
    const ClientSystemConfig = clientDbConnection.model('SystemConfig', 
      new mongoose.Schema({
        clientId: String,
        ...SystemConfig.schema.obj // Copy fields from our main SystemConfig schema
      }), 
      masterConfig.collections.systemconfigs
    );

    // Get client system config
    const config = await ClientSystemConfig.findOne({ clientId });

    if (!config) {
      return res.status(200).json({
        success: true,
        data: null,
        setupComplete: true,
        message: 'System configuration not found but database setup is complete'
      });
    }

    // Return configuration with masked MongoDB URI for security
    const configResponse = {
      ...config.toObject(),
      masterSetupComplete: true
    };

    return res.status(200).json({
      success: true,
      data: configResponse,
      setupComplete: true
    });
  } catch (error) {
    console.error('Error retrieving system configuration:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`
    });
  }
};

/**
 * @desc    Save system configuration
 * @route   POST /api/system/config
 * @access  Private/Admin
 */
exports.saveSystemConfig = async (req, res) => {
  try {
    const { clientId, ...configData } = req.body;

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
    const ClientSystemConfig = clientDbConnection.model('SystemConfig', 
      new mongoose.Schema({
        clientId: String,
        ...SystemConfig.schema.obj // Copy fields from our main SystemConfig schema
      }), 
      masterConfig.collections.systemconfigs
    );

    // Check if configuration already exists
    let systemConfig = await ClientSystemConfig.findOne({ clientId });

    if (systemConfig) {
      // Update existing configuration
      systemConfig = await ClientSystemConfig.findOneAndUpdate(
        { clientId },
        { 
          ...configData,
          clientId // Ensure clientId is preserved
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new configuration
      systemConfig = await ClientSystemConfig.create({
        ...configData,
        clientId
      });
    }

    return res.status(200).json({
      success: true,
      data: systemConfig,
      message: 'System configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving system configuration:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`
    });
  }
};

/**
 * @desc    Test MongoDB connection
 * @route   POST /api/system/test-connection
 * @access  Private/Admin
 */
exports.testConnection = async (req, res) => {
  try {
    const { mongoUri, clientId } = req.body;

    if (!mongoUri || !clientId) {
      return res.status(400).json({
        success: false,
        error: 'MongoDB URI and Client ID are required'
      });
    }

    // Try to connect to the provided MongoDB URI
    let connection;
    try {
      connection = await mongoose.createConnection(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      // Close the test connection
      await connection.close();
      
      return res.status(200).json({
        success: true,
        message: 'Connection successful'
      });
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
      
      // Ensure connection is closed if it was established
      if (connection) {
        await connection.close();
      }
      
      return res.status(400).json({
        success: false,
        error: `Connection failed: ${error.message}`
      });
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`
    });
  }
};

/**
 * @desc    Set up client MongoDB collections
 * @route   POST /api/system/set-connection
 * @access  Private/Admin
 */
exports.setConnection = async (req, res) => {
  try {
    const { mongoUri, clientId } = req.body;

    if (!mongoUri || !clientId) {
      return res.status(400).json({
        success: false,
        error: 'MongoDB URI and Client ID are required'
      });
    }

    // Check if the client already exists in MasterConfig
    let masterConfig = await MasterConfig.findOne({ clientId });
    
    // Define collection names (without client ID prefix)
    const collections = {
      schemes: 'schemes',
      executionlogs: 'executionlogs',
      systemconfigs: 'systemconfigs',
      kpiconfigs: 'kpiconfigs'
    };

    if (masterConfig) {
      // Update existing master config
      masterConfig = await MasterConfig.findOneAndUpdate(
        { clientId },
        { 
          mongoUri,
          setupComplete: true,
          collections
        },
        { new: true }
      );
    } else {
      // Create new master config
      masterConfig = await MasterConfig.create({
        clientId,
        mongoUri,
        setupComplete: true,
        collections
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Client database connection established and configured',
      data: {
        clientId: masterConfig.clientId,
        setupComplete: masterConfig.setupComplete
      }
    });
  } catch (error) {
    console.error('Error setting up connection:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`
    });
  }
};

/**
 * @desc    Get client's database connection status
 * @route   GET /api/system/connection-status
 * @access  Private/Admin
 */
exports.getConnectionStatus = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }

    const masterConfig = await MasterConfig.findOne({ clientId });

    if (!masterConfig) {
      return res.status(200).json({
        success: true,
        isConnected: false,
        message: 'Client database not configured'
      });
    }

    return res.status(200).json({
      success: true,
      isConnected: masterConfig.setupComplete,
      message: masterConfig.setupComplete 
        ? 'Client database is configured and connected' 
        : 'Client database is partially configured'
    });
  } catch (error) {
    console.error('Error checking connection status:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`
    });
  }
};
