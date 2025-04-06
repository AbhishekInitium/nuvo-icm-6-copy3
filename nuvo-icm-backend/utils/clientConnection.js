
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
    return cachedConnections[clientId];
  }

  // Fetch client configuration from master database
  const config = await MasterConfig.findOne({ clientId });
  
  if (!config || !config.mongoUri) {
    throw new Error(`MongoDB configuration not found for client: ${clientId}`);
  }

  if (!config.setupComplete) {
    throw new Error(`Database setup is not complete for client: ${clientId}`);
  }

  try {
    // Create a new connection to the client's MongoDB
    const conn = await mongoose.createConnection(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Set up connection error handlers
    conn.on('error', (err) => {
      console.error(`MongoDB connection error for client ${clientId}:`, err);
      delete cachedConnections[clientId];
    });

    conn.on('disconnected', () => {
      console.log(`MongoDB disconnected for client ${clientId}`);
      delete cachedConnections[clientId];
    });

    // Cache the connection
    cachedConnections[clientId] = conn;
    
    return conn;
  } catch (error) {
    console.error(`Failed to connect to MongoDB for client ${clientId}:`, error);
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
      return true;
    } catch (error) {
      console.error(`Error closing MongoDB connection for client ${clientId}:`, error);
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
