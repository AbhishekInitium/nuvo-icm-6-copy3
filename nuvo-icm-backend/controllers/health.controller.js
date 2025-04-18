
const mongoose = require('mongoose');
const { getClientConfig } = require('../utils/clientLoader');
const clients = require('../config/clients');
const Scheme = require('../models/Scheme');
const KpiConfig = require('../models/KpiConfig');

/**
 * Health check controller
 */
exports.healthCheck = (req, res) => {
  const baseResponse = {
    status: 'success',
    message: 'API is healthy and running',
    timestamp: new Date()
  };

  // Check if clientId is provided in query parameters
  if (req.query.clientId) {
    try {
      const clientConfig = getClientConfig(req.query.clientId);
      console.log(`Client config loaded for clientId: ${req.query.clientId}`);
      
      // Return response with client info (excluding sensitive data)
      return res.status(200).json({
        ...baseResponse,
        client: {
          clientId: clientConfig.clientId,
          sapSystemId: clientConfig.sapSystemId,
          mongoCollectionsPrefix: clientConfig.mongoCollectionsPrefix
        }
      });
    } catch (error) {
      console.error(`Error loading client configuration: ${error.message}`);
      return res.status(400).json({
        status: 'error',
        message: error.message,
        timestamp: new Date()
      });
    }
  }

  // If no clientId provided, return basic health check
  res.status(200).json(baseResponse);
};

/**
 * System diagnostics controller
 * Checks database connection and client configurations
 */
exports.systemDiagnostics = async (req, res) => {
  const result = {
    dbStatus: "unknown",
    clientsChecked: [],
    issues: [],
    timestamp: new Date()
  };

  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      result.dbStatus = "connected";
    } else {
      result.dbStatus = "disconnected";
      result.issues.push("MongoDB connection is not established");
    }
  } catch (error) {
    result.dbStatus = "error";
    result.issues.push(`MongoDB connection error: ${error.message}`);
  }

  // Check each client configuration
  for (const client of clients) {
    try {
      const clientId = client.clientId;
      result.clientsChecked.push(clientId);
      
      // Check if we can fetch a scheme for this client
      try {
        await Scheme.findOne({ clientId }).limit(1);
      } catch (error) {
        result.issues.push(`Failed to query Scheme for client ${clientId}: ${error.message}`);
      }

      // Check if we can fetch a KPI config for this client
      try {
        await KpiConfig.findOne({ clientId }).limit(1);
      } catch (error) {
        result.issues.push(`Failed to query KpiConfig for client ${clientId}: ${error.message}`);
      }
    } catch (error) {
      result.issues.push(`Error checking client ${client.clientId}: ${error.message}`);
    }
  }

  return res.status(200).json(result);
};
