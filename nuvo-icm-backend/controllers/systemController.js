
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

    console.log(`[MongoDB Test] Testing connection to MongoDB URI: ${mongoUri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@')}`);

    // Basic URI validation
    const uriPattern = /^mongodb(\+srv)?:\/\/[^\/]+\/[^?]+(\/|\?|$)/;
    if (!uriPattern.test(mongoUri)) {
      console.error('[MongoDB Test] Invalid MongoDB URI format');
      return res.status(400).json({
        success: false,
        error: 'Invalid MongoDB URI format. Required format: mongodb[+srv]://username:password@host/database'
      });
    }

    // Test connection to the provided MongoDB URI
    let testConnection = null;
    try {
      // Create a new Mongoose connection to test
      console.log('[MongoDB Test] Creating test connection...');
      
      // Create a promise that resolves or rejects based on connection events
      const connectionPromise = new Promise((resolve, reject) => {
        // Create a new connection without awaiting it yet
        testConnection = mongoose.createConnection();
        
        // Handle successful connection
        testConnection.once('connected', () => {
          console.log('[MongoDB Test] Connection established successfully');
          resolve(testConnection);
        });
        
        // Handle connection errors
        testConnection.once('error', (err) => {
          console.error('[MongoDB Test] Connection failed with error:', err);
          // Don't reject here, just capture the error to properly handle it below
          resolve({ error: err });
        });
        
        // Start the connection attempt
        testConnection.openUri(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
          socketTimeoutMS: 5000
        }).catch(err => {
          // This catches errors from openUri(), but doesn't throw
          console.error('[MongoDB Test] openUri error caught:', err);
          resolve({ error: err });
        });
      });
      
      // Add a timeout in case the connection attempt hangs
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('[MongoDB Test] Connection attempt timed out');
          resolve({ error: new Error('Connection timeout - took too long to establish connection') });
        }, 7000); // 7 seconds timeout
      });
      
      // Race the connection and timeout
      const result = await Promise.race([connectionPromise, timeoutPromise]);
      
      // Check if result is a connection object or an error
      if (result && result.error) {
        throw result.error;
      }
      
      // If we get here, we have a successful connection
      console.log(`[MongoDB Test] Connection state: ${testConnection.readyState}`);
      
      // Try to ping the database (but catch errors properly)
      try {
        if (testConnection && testConnection.db) {
          await testConnection.db.admin().command({ ping: 1 });
          console.log(`[MongoDB Test] Successfully connected to: ${testConnection.host || 'unknown'}:${testConnection.port || 'unknown'}`);
          
          // Close the test connection
          if (testConnection) {
            await testConnection.close();
            console.log(`[MongoDB Test] Test connection closed successfully`);
          }
          
          return res.status(200).json({
            success: true,
            message: 'Connection successful',
          });
        } else {
          throw new Error('Connection object or database not available');
        }
      } catch (pingError) {
        console.error('[MongoDB Test] Database ping failed:', pingError);
        
        // Try to close the connection if it exists
        if (testConnection) {
          try {
            await testConnection.close();
            console.log('[MongoDB Test] Connection closed after ping failure');
          } catch (closeError) {
            console.error('[MongoDB Test] Error closing connection:', closeError);
          }
        }
        
        throw pingError;
      }
    } catch (connectionError) {
      console.error('[MongoDB Test] Connection test failed with error:');
      console.error(connectionError);
      
      // Try to close the connection if it exists
      if (testConnection) {
        try {
          await testConnection.close(true);
          console.log('[MongoDB Test] Connection closed after error');
        } catch (closeError) {
          console.error('[MongoDB Test] Error closing connection:', closeError);
        }
      }
      
      // Parse the error to return a friendly message
      let errorDetails = connectionError.message || 'Unknown connection error';
      let detailedError = 'Could not connect to MongoDB.';
      
      // Check for Atlas authentication error (most common in logs)
      if (connectionError.name === 'MongoServerError' && connectionError.codeName === 'AtlasError') {
        detailedError = 'Authentication failed with MongoDB Atlas. Please verify your username and password.';
      } else if (connectionError.message && connectionError.message.includes('bad auth')) {
        detailedError = 'Authentication failed. Please verify your username and password.';
      } else if (connectionError.name === 'MongoServerSelectionError') {
        detailedError = 'Could not reach MongoDB server. Check if the server address is correct and accessible.';
      } else if (connectionError.name === 'MongoParseError') {
        detailedError = 'MongoDB connection string format is invalid. Please check the URI format.';
      } else if (connectionError.message && connectionError.message.includes('Authentication failed')) {
        detailedError = 'Authentication failed. Please verify username and password in your connection string.';
      } else if (connectionError.message && connectionError.message.includes('ENOTFOUND')) {
        detailedError = 'Host not found. Please check if the MongoDB server hostname is correct.';
      } else if (connectionError.message && connectionError.message.includes('ECONNREFUSED')) {
        detailedError = 'Connection refused. MongoDB server may not be running or port may be blocked.';
      }
      
      return res.status(400).json({ 
        success: false, 
        error: detailedError
      });
    }
  } catch (error) {
    console.error('[MongoDB Test] Unexpected error during connection test:', error);
    
    // Ensure that the response is sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: `Server Error: ${error.message}`
      });
    }
  }
};

/**
 * @desc    Save system configuration
 * @route   POST /api/system/config
 * @access  Private/Admin
 */
exports.saveSystemConfig = async (req, res) => {
  try {
    const { clientId, mongoUri, sapSystemId, sapBaseUrl, sapUsername, sapPassword } = req.body;

    if (!clientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Client ID is required' 
      });
    }

    console.log(`[SystemConfig] Saving configuration for client: ${clientId}`);

    // First, check if the MasterConfig exists for this client
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    if (!masterConfig) {
      console.error(`[SystemConfig] MasterConfig not found for client: ${clientId}`);
      return res.status(404).json({ 
        success: false, 
        error: `Configuration not found for client: ${clientId}. Please set up the database connection first.` 
      });
    }

    // Update the MasterConfig with the MongoDB URI if provided
    if (mongoUri) {
      console.log(`[SystemConfig] Updating MasterConfig with new MongoDB URI for client: ${clientId}`);
      
      masterConfig.mongoUri = mongoUri;
      await masterConfig.save();
      
      console.log(`[SystemConfig] MasterConfig updated successfully for client: ${clientId}`);
    }

    // Now, find or create the SystemConfig
    const configData = {
      clientId,
      sapSystemId: sapSystemId || '',
      sapBaseUrl: sapBaseUrl || '',
      sapUsername: sapUsername || '',
      sapPassword: sapPassword || ''
    };

    // Try to create or update the SystemConfig in the client's database
    try {
      // Initialize a connection to the client database
      const clientConn = mongoose.createConnection(masterConfig.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      // Wait for the connection to be established
      await new Promise((resolve, reject) => {
        clientConn.once('connected', resolve);
        clientConn.once('error', (err) => {
          console.error(`[SystemConfig] Error connecting to client database: ${err}`);
          reject(err);
        });
      });
      
      // Create the SystemConfig model using the client connection
      const ClientSystemConfig = clientConn.model('SystemConfig', SystemConfig.schema);
      
      // Find and update or create new SystemConfig
      const existingConfig = await ClientSystemConfig.findOne({ clientId });
      
      let savedConfig;
      if (existingConfig) {
        // Update existing config
        Object.assign(existingConfig, configData);
        savedConfig = await existingConfig.save();
        console.log(`[SystemConfig] Updated configuration for client: ${clientId}`);
      } else {
        // Create new config
        savedConfig = await ClientSystemConfig.create(configData);
        console.log(`[SystemConfig] Created new configuration for client: ${clientId}`);
      }
      
      // Close the connection
      await clientConn.close();
      
      return res.status(200).json({
        success: true,
        message: `System configuration saved successfully for client: ${clientId}`,
        data: {
          clientId: savedConfig.clientId,
          status: 'configured',
          timestamp: savedConfig.createdAt
        }
      });
    } catch (clientDbError) {
      console.error(`[SystemConfig] Error saving to client database: ${clientDbError}`);
      
      return res.status(500).json({
        success: false,
        error: `Error saving configuration: ${clientDbError.message}`
      });
    }
  } catch (error) {
    console.error('[SystemConfig] Error saving system configuration:', error);
    
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

    console.log(`[SystemConfig] Getting configuration for client: ${clientId}`);

    // Check if the MasterConfig exists for this client
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    if (!masterConfig) {
      console.log(`[SystemConfig] MasterConfig not found for client: ${clientId}`);
      return res.status(404).json({ 
        success: false, 
        error: `Configuration not found for client: ${clientId}` 
      });
    }

    // Check if the database setup is complete
    const setupComplete = !!masterConfig.setupComplete;

    // If the setup is complete, try to get the system config from the client DB
    if (setupComplete && masterConfig.mongoUri) {
      try {
        // Initialize a connection to the client database
        const clientConn = mongoose.createConnection(masterConfig.mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        
        // Wait for the connection to be established
        await new Promise((resolve, reject) => {
          clientConn.once('connected', resolve);
          clientConn.once('error', (err) => {
            console.error(`[SystemConfig] Error connecting to client database: ${err}`);
            reject(err);
          });
        });
        
        // Create the SystemConfig model using the client connection
        const ClientSystemConfig = clientConn.model('SystemConfig', SystemConfig.schema);
        
        // Find the system config
        const systemConfig = await ClientSystemConfig.findOne({ clientId });
        
        // Close the connection
        await clientConn.close();
        
        if (systemConfig) {
          // Mask sensitive data
          const maskedConfig = {
            ...systemConfig.toObject(),
            mongoUri: masterConfig.mongoUri ? masterConfig.mongoUri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@') : null,
            sapPassword: systemConfig.sapPassword ? '********' : null
          };
          
          return res.status(200).json({
            success: true,
            data: maskedConfig,
            setupComplete: true
          });
        } else {
          console.log(`[SystemConfig] No SystemConfig found in client DB for client: ${clientId}`);
          
          return res.status(200).json({
            success: true,
            setupComplete: true,
            message: 'Database setup is complete, but no system configuration has been saved yet.'
          });
        }
      } catch (clientDbError) {
        console.error(`[SystemConfig] Error accessing client database: ${clientDbError}`);
        
        return res.status(500).json({
          success: false,
          error: `Error retrieving configuration: ${clientDbError.message}`
        });
      }
    } else {
      // Return just the master config data
      return res.status(200).json({
        success: true,
        setupComplete: setupComplete,
        data: {
          clientId: masterConfig.clientId,
          mongoUri: masterConfig.mongoUri ? masterConfig.mongoUri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@') : null
        }
      });
    }
  } catch (error) {
    console.error('[SystemConfig] Error getting system configuration:', error);
    
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
    const { clientId, mongoUri } = req.body;

    if (!clientId || !mongoUri) {
      return res.status(400).json({ 
        success: false, 
        error: 'Client ID and MongoDB URI are required' 
      });
    }

    console.log(`[MongoDB Setup] Setting up collections for client: ${clientId} with URI: ${mongoUri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@')}`);

    // Connect to the MongoDB database
    let clientConn = null;
    try {
      // Create a connection to the provided MongoDB URI
      clientConn = mongoose.createConnection();
      
      // Handle connection events
      const connectionPromise = new Promise((resolve, reject) => {
        clientConn.once('connected', () => {
          console.log(`[MongoDB Setup] Connected to client database for setup: ${clientId}`);
          resolve(clientConn);
        });
        
        clientConn.once('error', (err) => {
          console.error(`[MongoDB Setup] Connection error for client ${clientId}:`, err);
          reject(err);
        });
        
        // Start the connection
        clientConn.openUri(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000 // 10 seconds timeout
        }).catch(reject);
      });
      
      // Wait for the connection to be established
      await connectionPromise;
      
      // Create the required collections
      const db = clientConn.db;
      
      // Define collection names
      const collectionNames = [
        `${clientId}.schemes`,
        `${clientId}.executionlogs`,
        `${clientId}.kpiconfigs`,
        `${clientId}.systemconfigs`
      ];
      
      // Create collections
      const createPromises = collectionNames.map(async (collName) => {
        try {
          const exists = await db.listCollections({ name: collName }).hasNext();
          
          if (!exists) {
            console.log(`[MongoDB Setup] Creating collection: ${collName}`);
            await db.createCollection(collName);
            console.log(`[MongoDB Setup] Collection created: ${collName}`);
          } else {
            console.log(`[MongoDB Setup] Collection already exists: ${collName}`);
          }
          
          return { name: collName, created: !exists };
        } catch (err) {
          console.error(`[MongoDB Setup] Error creating collection ${collName}:`, err);
          throw err;
        }
      });
      
      // Wait for all collection creation operations to complete
      await Promise.all(createPromises);
      
      // Create or update the master config
      let masterConfig = await MasterConfig.findOne({ clientId });
      
      if (masterConfig) {
        masterConfig.mongoUri = mongoUri;
        masterConfig.setupComplete = true;
        await masterConfig.save();
        console.log(`[MongoDB Setup] Updated MasterConfig for client: ${clientId}`);
      } else {
        masterConfig = await MasterConfig.create({
          clientId,
          mongoUri,
          setupComplete: true,
          createdAt: new Date()
        });
        console.log(`[MongoDB Setup] Created new MasterConfig for client: ${clientId}`);
      }
      
      // Close the connection when done
      await clientConn.close();
      console.log(`[MongoDB Setup] Connection closed after setup for client: ${clientId}`);
      
      return res.status(200).json({
        success: true,
        message: `Database collections setup complete for client: ${clientId}`,
        data: {
          clientId,
          collections: {
            schemes: `${clientId}.schemes`,
            executionlogs: `${clientId}.executionlogs`,
            kpiconfigs: `${clientId}.kpiconfigs`,
            systemconfigs: `${clientId}.systemconfigs`
          },
          setupComplete: true,
          createdAt: masterConfig.createdAt
        }
      });
    } catch (error) {
      console.error('[MongoDB Setup] Error setting up collections:', error);
      
      // Try to close the connection if it exists
      if (clientConn) {
        try {
          await clientConn.close();
          console.log(`[MongoDB Setup] Connection closed after error for client: ${clientId}`);
        } catch (closeError) {
          console.error(`[MongoDB Setup] Error closing connection:`, closeError);
        }
      }
      
      // Detailed error handling
      let errorMessage = 'Error setting up database collections';
      
      if (error.name === 'MongoServerError' && error.codeName === 'AtlasError') {
        errorMessage = 'Authentication failed with MongoDB Atlas. Please verify your username and password.';
      } else if (error.message && error.message.includes('bad auth')) {
        errorMessage = 'Authentication failed. Please verify your username and password.';
      } else if (error.name === 'MongoServerSelectionError') {
        errorMessage = 'Could not reach MongoDB server. Check if the server address is correct and accessible.';
      } else if (error.name === 'MongoParseError') {
        errorMessage = 'MongoDB connection string format is invalid. Please check the URI format.';
      } else if (error.message && error.message.includes('ENOTFOUND')) {
        errorMessage = 'Host not found. Please check if the MongoDB server hostname is correct.';
      } else if (error.message && error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. MongoDB server may not be running or port may be blocked.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
  } catch (error) {
    console.error('[MongoDB Setup] Unexpected error during setup:', error);
    
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
    
    // If clientId is provided, check status for that client
    if (clientId) {
      // First check if client exists in MasterConfig
      const masterConfig = await MasterConfig.findOne({ clientId });
      
      if (!masterConfig) {
        return res.status(404).json({
          success: false,
          error: `Client not found: ${clientId}`
        });
      }
      
      // If client exists but setup is not complete
      if (!masterConfig.setupComplete) {
        return res.status(200).json({
          success: true,
          data: {
            clientId,
            connected: false,
            readyState: 0,
            setupComplete: false
          }
        });
      }
      
      // Check actual connection status
      const clientUtil = require('../utils/clientConnection');
      const status = clientUtil.getConnectionStatus();
      
      // If client connection exists in cache
      if (status[clientId]) {
        return res.status(200).json({
          success: true,
          data: {
            clientId,
            connected: status[clientId].connected,
            readyState: status[clientId].readyState,
            setupComplete: true
          }
        });
      } else {
        // If client connection not in cache, try to establish
        try {
          await clientUtil.connectClientDb(clientId);
          
          // Get updated status after connection attempt
          const updatedStatus = clientUtil.getConnectionStatus();
          
          return res.status(200).json({
            success: true,
            data: {
              clientId,
              connected: updatedStatus[clientId]?.connected || false,
              readyState: updatedStatus[clientId]?.readyState || 0,
              setupComplete: true
            }
          });
        } catch (connErr) {
          console.error(`[ConnectionStatus] Error connecting to client database ${clientId}:`, connErr);
          
          return res.status(200).json({
            success: true,
            data: {
              clientId,
              connected: false,
              readyState: 0,
              error: connErr.message,
              setupComplete: true
            }
          });
        }
      }
    } else {
      // If no clientId provided, return status for all clients
      const clientUtil = require('../utils/clientConnection');
      const allStatuses = clientUtil.getConnectionStatus();
      
      return res.status(200).json({
        success: true,
        data: allStatuses
      });
    }
  } catch (error) {
    console.error('[ConnectionStatus] Error getting connection status:', error);
    
    return res.status(500).json({
      success: false,
      error: `Server Error: ${error.message}`
    });
  }
};
