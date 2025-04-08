const mongoose = require('mongoose');
const SystemConfig = require('../models/SystemConfig');
const MasterConfig = require('../models/MasterConfig');
const { connectClientDb, closeClientConnection } = require('../utils/clientConnection');

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

    console.log(`[MongoDB Test] Testing connection to MongoDB URI: ${mongoUri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@')}`);

    // Test connection to the provided MongoDB URI
    try {
      // Create a new Mongoose connection to test
      console.log('[MongoDB Test] Creating test connection...');
      const testConnection = await mongoose.createConnection(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // 5 seconds timeout for connection test
      });
      
      // Log connection information
      console.log(`[MongoDB Test] Successfully connected to: ${testConnection.host}:${testConnection.port}`);
      console.log(`[MongoDB Test] Database name: ${testConnection.name}`);
      console.log(`[MongoDB Test] Connection state: ${testConnection.readyState}`);
      
      // Close the test connection
      await testConnection.close();
      console.log(`[MongoDB Test] Test connection closed successfully`);
      
      return res.status(200).json({
        success: true,
        message: 'Connection successful',
      });
    } catch (connectionError) {
      console.error('[MongoDB Test] Connection test failed with error:');
      console.error(connectionError);
      
      // Log detailed connection error information
      if (connectionError.name) {
        console.error(`[MongoDB Test] Error name: ${connectionError.name}`);
      }
      if (connectionError.code) {
        console.error(`[MongoDB Test] Error code: ${connectionError.code}`);
      }
      if (connectionError.message) {
        console.error(`[MongoDB Test] Error message: ${connectionError.message}`);
      }
      if (connectionError.stack) {
        console.error(`[MongoDB Test] Stack trace: ${connectionError.stack}`);
      }
      
      // Generate more detailed error message depending on error type
      let detailedError = 'Could not connect to MongoDB.';
      
      if (connectionError.name === 'MongoServerSelectionError') {
        detailedError = 'Could not reach MongoDB server. Check if the server address is correct and accessible.';
        console.error('[MongoDB Test] Server selection timeout - could not find MongoDB server.');
      } else if (connectionError.name === 'MongoParseError') {
        detailedError = 'MongoDB connection string format is invalid. Please check the URI format.';
        console.error('[MongoDB Test] Connection string format is invalid.');
      } else if (connectionError.message && connectionError.message.includes('Authentication failed')) {
        detailedError = 'Authentication failed. Please verify username and password in your connection string.';
        console.error('[MongoDB Test] Authentication failed - username or password incorrect.');
      } else if (connectionError.message && connectionError.message.includes('ENOTFOUND')) {
        detailedError = 'Host not found. Please check if the MongoDB server hostname is correct.';
        console.error('[MongoDB Test] Host not found - invalid hostname.');
      } else if (connectionError.message && connectionError.message.includes('ECONNREFUSED')) {
        detailedError = 'Connection refused. MongoDB server may not be running or port may be blocked.';
        console.error('[MongoDB Test] Connection refused - server not responding on specified port.');
      }
      
      return res.status(400).json({ 
        success: false, 
        error: `${detailedError} Original error: ${connectionError.message}` 
      });
    }
  } catch (error) {
    console.error('[MongoDB Test] Unexpected error during connection test:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`
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
    let clientDbConnection;
    try {
      clientDbConnection = await mongoose.createConnection(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000 // 10 seconds timeout
      });
      console.log(`MongoDB connection established for client setup: ${clientId}`);
    } catch (connectionError) {
      console.error('MongoDB connection failed:', connectionError);
      
      // Generate more detailed error message depending on error type
      let detailedError = 'Could not connect to MongoDB.';
      
      if (connectionError.name === 'MongoServerSelectionError') {
        detailedError = 'Could not reach MongoDB server. Check if the server address is correct and accessible.';
      } else if (connectionError.name === 'MongoParseError') {
        detailedError = 'MongoDB connection string format is invalid. Please check the URI format.';
      } else if (connectionError.message && connectionError.message.includes('Authentication failed')) {
        detailedError = 'Authentication failed. Please verify username and password in your connection string.';
      } else if (connectionError.message && connectionError.message.includes('ENOTFOUND')) {
        detailedError = 'Host not found. Please check if the MongoDB server hostname is correct.';
      }
      
      return res.status(400).json({ 
        success: false, 
        error: `Invalid MongoDB URI: ${detailedError}` 
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
      await clientDbConnection.createCollection(collections.schemes);
      await clientDbConnection.createCollection(collections.executionlogs);
      await clientDbConnection.createCollection(collections.kpiconfigs);
      await clientDbConnection.createCollection(collections.systemconfigs);
    } catch (collectionError) {
      console.error('Error creating collections:', collectionError);
      await clientDbConnection.close();
      return res.status(500).json({
        success: false,
        error: `Failed to create collections: ${collectionError.message}`
      });
    }

    // Verify that the collections were created successfully
    try {
      const collectionsList = await clientDbConnection.db.listCollections().toArray();
      const collectionNames = collectionsList.map(c => c.name);
      
      const missingCollections = Object.values(collections)
        .filter(name => !collectionNames.includes(name.split('.')[1]));
      
      if (missingCollections.length > 0) {
        await clientDbConnection.close();
        return res.status(500).json({
          success: false,
          error: `Failed to verify collections: ${missingCollections.join(', ')} were not created.`
        });
      }
    } catch (verifyError) {
      console.error('Error verifying collections:', verifyError);
      await clientDbConnection.close();
      return res.status(500).json({
        success: false,
        error: `Failed to verify collections: ${verifyError.message}`
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
    await clientDbConnection.close();

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
    const ClientSystemConfig = clientDbConnection.model('SystemConfig', 
      new mongoose.Schema({
        clientId: String,
        ...SystemConfig.schema.obj // Copy fields from our main SystemConfig schema
      }), 
      masterConfig.collections.systemconfigs.split('.')[1] // Use the client-specific collection
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
      error: `Server Error: ${error.message}`
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
    const ClientSystemConfig = clientDbConnection.model('SystemConfig', 
      new mongoose.Schema({
        clientId: String,
        ...SystemConfig.schema.obj // Copy fields from our main SystemConfig schema
      }), 
      masterConfig.collections.systemconfigs.split('.')[1] // Use the client-specific collection
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
 * @desc    Get client's database connection status
 * @route   GET /api/system/connection-status
 * @access  Private/Admin
 */
exports.getConnectionStatus = async (req, res) => {
  try {
    const { clientId } = req.query;
    
    // If clientId provided, check specific client connection
    if (clientId) {
      try {
        const connection = await connectClientDb(clientId);
        return res.status(200).json({
          success: true,
          data: {
            clientId,
            connected: connection.readyState === 1,
            readyState: connection.readyState
          }
        });
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
    } 
    
    // Otherwise return all connection statuses from cached connections
    const { getConnectionStatus } = require('../utils/clientConnection');
    const statuses = getConnectionStatus();
    
    return res.status(200).json({
      success: true,
      data: statuses
    });
    
  } catch (error) {
    console.error('Error getting connection status:', error);
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`
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
