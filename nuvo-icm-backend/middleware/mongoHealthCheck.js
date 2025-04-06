const mongoose = require('mongoose');
const SystemConfig = require('../models/SystemConfig');

/**
 * Middleware to check MongoDB connection health before processing requests
 * This will attempt to use client-specific MongoDB URI if available
 */
const checkMongoHealth = async (req, res, next) => {
  // Extract clientId from query or body
  const clientId = req.query.clientId || (req.body && req.body.clientId);
  
  if (!clientId) {
    return res.status(400).json({
      success: false,
      error: 'Client ID is required for database operations'
    });
  }
  
  try {
    // Check if we have a system config with MongoDB URI for this client
    const config = await SystemConfig.findOne({ clientId });
    
    // If we have a client-specific MongoDB URI, use it
    if (config && config.mongoUri) {
      // If already connected to the right database, proceed
      if (mongoose.connection.readyState === 1 && 
          mongoose.connection.client.s.url === config.mongoUri) {
        return next();
      }
      
      // Otherwise connect to the client-specific database
      try {
        // If connected to a different URI, close current connection
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
        }
        
        // Connect to client-specific MongoDB
        await mongoose.connect(config.mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        
        console.log(`Connected to client-specific MongoDB for client: ${clientId}`);
        return next();
      } catch (error) {
        console.error(`Failed to connect to client-specific MongoDB: ${error.message}`);
        return res.status(500).json({
          success: false,
          error: 'Database connection failed'
        });
      }
    }
    
    // If no client-specific URI, check if default connection is established
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection is not established');
      return res.status(503).json({
        success: false,
        error: 'Database connection is not available'
      });
    }
    
    // If we reach here, default connection is active
    next();
  } catch (error) {
    console.error('Error checking MongoDB health:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error when checking database connection'
    });
  }
};

module.exports = checkMongoHealth;
