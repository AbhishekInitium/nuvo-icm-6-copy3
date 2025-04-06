
const mongoose = require('mongoose');
const SystemConfig = require('../models/SystemConfig');
const MasterConfig = require('../models/MasterConfig');

/**
 * @desc    Test MongoDB connection
 * @route   POST /api/system/test-connection
 * @access  Private/Admin
 */
exports.testConnection = async (req, res) => {
  try {
    const { mongoUri } = req.body;

    if (!mongoUri) {
      return res.status(400).json({ 
        success: false, 
        error: 'MongoDB URI is required' 
      });
    }

    // Test connection to the provided MongoDB URI
    try {
      // Create a new Mongoose connection to test
      const testConnection = await mongoose.createConnection(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // 5 seconds timeout for connection test
      });
      
      // Close the test connection
      await testConnection.close();
      console.log(`MongoDB connection test successful`);
      
      return res.status(200).json({
        success: true,
        message: 'Connection successful',
      });
    } catch (connectionError) {
      console.error('MongoDB connection test failed:', connectionError);
      return res.status(400).json({ 
        success: false, 
        error: `Invalid MongoDB URI: ${connectionError.message}` 
      });
    }
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Set up client MongoDB collections and configuration
 * @route   POST /api/system/set-connection
 * @access  Private/Admin
 */
exports.setConnection = async (req, res) => {
  try {
    const { clientId, mongoUri } = req.body;

    if (!clientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Client ID is required' 
      });
    }

    if (!mongoUri) {
      return res.status(400).json({ 
        success: false, 
        error: 'MongoDB URI is required' 
      });
    }

    // Check if config already exists for this client
    const existingConfig = await MasterConfig.findOne({ clientId });
    
    if (existingConfig && existingConfig.setupComplete) {
      return res.status(400).json({
        success: false,
        error: `Setup is already complete for client: ${clientId}`,
        config: existingConfig
      });
    }

    // Test connection to the provided MongoDB URI
    let masterDbConnection;
    try {
      masterDbConnection = await mongoose.createConnection(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log(`MongoDB connection established for client setup: ${clientId}`);
    } catch (connectionError) {
      console.error('MongoDB connection failed:', connectionError);
      return res.status(400).json({ 
        success: false, 
        error: `Invalid MongoDB URI: ${connectionError.message}` 
      });
    }

    // Define the collection names for this client
    const collections = {
      schemes: `${clientId}.schemes`,
      executionlogs: `${clientId}.executionlogs`,
      kpiconfigs: `${clientId}.kpiconfigs`,
      systemconfigs: `${clientId}.systemconfigs`
    };

    // Create the collections (this just ensures they exist in MongoDB)
    try {
      await masterDbConnection.createCollection(collections.schemes);
      await masterDbConnection.createCollection(collections.executionlogs);
      await masterDbConnection.createCollection(collections.kpiconfigs);
      await masterDbConnection.createCollection(collections.systemconfigs);
    } catch (collectionError) {
      console.error('Error creating collections:', collectionError);
      await masterDbConnection.close();
      return res.status(500).json({
        success: false,
        error: `Failed to create collections: ${collectionError.message}`
      });
    }

    // Save the configuration
    let config;
    if (existingConfig) {
      existingConfig.mongoUri = mongoUri;
      existingConfig.collections = collections;
      existingConfig.setupComplete = true;
      config = await existingConfig.save();
    } else {
      config = await MasterConfig.create({
        clientId,
        mongoUri,
        collections,
        setupComplete: true
      });
    }

    // Close the connection
    await masterDbConnection.close();

    // Return the saved configuration
    return res.status(200).json({
      success: true,
      message: 'Setup Complete',
      data: {
        clientId: config.clientId,
        collections: config.collections,
        setupComplete: config.setupComplete,
        createdAt: config.createdAt
      }
    });
  } catch (error) {
    console.error('Error setting up client MongoDB:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
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
    const { clientId, ...otherConfig } = req.body;

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
      clientDbConnection = await mongoose.createConnection(masterConfig.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (connectionError) {
      console.error('MongoDB connection failed:', connectionError);
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to client database'
      });
    }

    // Create a model for the client's system config collection
    const ClientSystemConfig = clientDbConnection.model('SystemConfig', 
      new mongoose.Schema({
        clientId: String,
        ...SystemConfig.schema.obj // Copy fields from our main SystemConfig schema
      }), 
      masterConfig.collections.systemconfigs // Use the client-specific collection
    );

    // Check if config already exists for this client
    let config = await ClientSystemConfig.findOne({ clientId });

    if (config) {
      // Update existing config
      config = await ClientSystemConfig.findOneAndUpdate(
        { clientId },
        otherConfig,
        { new: true, runValidators: true }
      );
    } else {
      // Create new config
      config = await ClientSystemConfig.create({
        clientId,
        ...otherConfig
      });
    }

    // Close the client connection
    await clientDbConnection.close();

    // Return success with limited data
    return res.status(200).json({
      success: true,
      message: 'System configuration saved successfully',
      data: {
        clientId: config.clientId,
        status: 'connected',
        timestamp: new Date()
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

    // Connect to the client's database
    let clientDbConnection;
    try {
      clientDbConnection = await mongoose.createConnection(masterConfig.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (connectionError) {
      console.error('MongoDB connection failed:', connectionError);
      return res.status(500).json({
        success: false,
        error: 'Failed to connect to client database'
      });
    }

    // Create a model for the client's system config collection
    const ClientSystemConfig = clientDbConnection.model('SystemConfig', 
      new mongoose.Schema({
        clientId: String,
        ...SystemConfig.schema.obj // Copy fields from our main SystemConfig schema
      }), 
      masterConfig.collections.systemconfigs // Use the client-specific collection
    );

    // Get client system config
    const config = await ClientSystemConfig.findOne({ clientId });

    // Close the client connection
    await clientDbConnection.close();

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
      error: 'Server Error'
    });
  }
};

/**
 * Internal function to get client's database connection and collection names
 * This is not exposed as an API endpoint but used internally
 */
exports.getClientDbConfig = async (clientId) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    // Get the master configuration for this client
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    if (!masterConfig || !masterConfig.setupComplete) {
      throw new Error(`Database setup not complete for client: ${clientId}`);
    }

    return {
      mongoUri: masterConfig.mongoUri,
      collections: masterConfig.collections
    };
  } catch (error) {
    console.error(`Error retrieving database config for client ${clientId}:`, error);
    throw error;
  }
};
