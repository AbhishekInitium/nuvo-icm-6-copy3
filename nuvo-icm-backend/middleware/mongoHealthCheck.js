
const mongoose = require('mongoose');
const MasterConfig = require('../models/MasterConfig');

/**
 * Middleware to check MongoDB connection health before processing requests
 * This will attempt to use client-specific MongoDB URI from MasterConfig
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
    // Check if we have a master config with MongoDB URI for this client
    const masterConfig = await MasterConfig.findOne({ clientId });
    
    // If client has not been set up, return error
    if (!masterConfig || !masterConfig.setupComplete) {
      return res.status(400).json({
        success: false,
        error: `Database setup is not complete for client: ${clientId}`
      });
    }
    
    // If we have a client-specific MongoDB URI, use it
    if (masterConfig.mongoUri) {
      // If already connected to the right database, proceed
      if (mongoose.connection.readyState === 1 && 
          mongoose.connection.client.s.url === masterConfig.mongoUri) {
        // Store collections info in request for controllers to use
        req.clientCollections = masterConfig.collections;
        return next();
      }
      
      // Otherwise connect to the client-specific database
      try {
        // If connected to a different URI, close current connection
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
        }
        
        // Connect to client-specific MongoDB
        const conn = await mongoose.connect(masterConfig.mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        
        // Store collections info in request for controllers to use
        req.clientCollections = masterConfig.collections;
        
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
    
    // If no client-specific URI found but we got this far, something is wrong
    return res.status(503).json({
      success: false,
      error: 'Client database configuration is incomplete'
    });
  } catch (error) {
    console.error('Error checking MongoDB health:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error when checking database connection'
    });
  }
};

module.exports = checkMongoHealth;
