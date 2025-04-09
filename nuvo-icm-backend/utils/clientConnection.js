
const mongoose = require('mongoose');
const MasterConfig = require('../models/MasterConfig');

// Cache to store active connections
const cachedConnections = {};

/**
 * Connect to a client's specific MongoDB database
 * @param {string} clientId - The client identifier
 * @returns {Promise<mongoose.Connection>} A connection to the client's database
 */
async function connectClientDb(clientId) {
  if (!clientId) {
    throw new Error('Client ID is required');
  }

  // Return cached connection if it exists and is open
  if (cachedConnections[clientId] && 
      cachedConnections[clientId].readyState === 1) { // 1 = connected
    console.log(`[MongoDB] Using cached connection for client: ${clientId} (State: ${cachedConnections[clientId].readyState})`);
    return cachedConnections[clientId];
  }

  // Fetch client configuration from master database
  const config = await MasterConfig.findOne({ clientId });
  
  if (!config || !config.mongoUri) {
    console.error(`[MongoDB] Configuration not found for client: ${clientId}`);
    throw new Error(`MongoDB configuration not found for client: ${clientId}`);
  }

  if (!config.setupComplete) {
    console.error(`[MongoDB] Setup not complete for client: ${clientId}`);
    throw new Error(`Database setup is not complete for client: ${clientId}`);
  }

  try {
    // Create a new connection to the client's MongoDB
    console.log(`[MongoDB] Connecting to MongoDB for client: ${clientId} - URI: ${config.mongoUri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@')}`);
    
    // Create a new connection with proper error handling
    const conn = mongoose.createConnection();
    
    // Create a promise that resolves when connected or rejects on error
    const connectionPromise = new Promise((resolve, reject) => {
      conn.once('connected', () => {
        console.log(`[MongoDB] Connected to MongoDB for client: ${clientId}`);
        resolve(conn);
      });
      
      conn.once('error', (err) => {
        console.error(`[MongoDB] Connection error for client ${clientId}:`, err);
        reject(err);
      });
      
      // Start the connection
      conn.openUri(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000 // 10 seconds timeout
      }).catch(reject);
    });
    
    // Wait for connection to be established
    const connection = await connectionPromise;

    // Set up connection error handlers for future events
    connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error for client ${clientId}:`, err);
      delete cachedConnections[clientId];
    });

    connection.on('disconnected', () => {
      console.log(`[MongoDB] Disconnected for client ${clientId}`);
      delete cachedConnections[clientId];
    });

    // Cache the connection
    cachedConnections[clientId] = connection;
    console.log(`[MongoDB] Connected to MongoDB for client: ${clientId} (Host: ${connection.host}, Port: ${connection.port}, DB: ${connection.name})`);
    
    return connection;
  } catch (error) {
    console.error(`[MongoDB] Failed to connect to MongoDB for client ${clientId}:`, error);
    console.error(`[MongoDB] Error details - Name: ${error.name}, Code: ${error.code}, Message: ${error.message}`);
    
    if (error.stack) {
      console.error(`[MongoDB] Stack trace:`, error.stack);
    }
    
    throw new Error(`Connection failed: ${error.message}`);
  }
}

/**
 * Close a client's database connection
 * @param {string} clientId - The client identifier
 */
async function closeClientConnection(clientId) {
  if (cachedConnections[clientId]) {
    try {
      await cachedConnections[clientId].close();
      delete cachedConnections[clientId];
      console.log(`[MongoDB] Connection closed for client: ${clientId}`);
      return true;
    } catch (error) {
      console.error(`[MongoDB] Error closing MongoDB connection for client ${clientId}:`, error);
      return false;
    }
  }
  return false;
}

/**
 * Close all client connections
 */
async function closeAllConnections() {
  const clientIds = Object.keys(cachedConnections);
  for (const clientId of clientIds) {
    await closeClientConnection(clientId);
  }
  console.log(`[MongoDB] All client connections closed (${clientIds.length} connections)`);
}

/**
 * Get the status of all client connections
 * @returns {Object} Status of all connections
 */
function getConnectionStatus() {
  const status = {};
  for (const [clientId, conn] of Object.entries(cachedConnections)) {
    status[clientId] = {
      readyState: conn.readyState,
      connected: conn.readyState === 1
    };
  }
  return status;
}

module.exports = {
  connectClientDb,
  closeClientConnection,
  closeAllConnections,
  getConnectionStatus
};
