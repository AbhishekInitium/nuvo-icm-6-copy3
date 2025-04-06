
const mongoose = require('mongoose');
const SystemConfig = require('../models/SystemConfig');

/**
 * @desc    Save system configuration including MongoDB URI
 * @route   POST /api/system/config
 * @access  Private/Admin
 */
exports.saveSystemConfig = async (req, res) => {
  try {
    const { clientId, mongoUri, ...otherConfig } = req.body;

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
      console.log(`MongoDB connection test successful for client: ${clientId}`);
    } catch (connectionError) {
      console.error('MongoDB connection test failed:', connectionError);
      return res.status(400).json({ 
        success: false, 
        error: `Invalid MongoDB URI: ${connectionError.message}` 
      });
    }

    // Check if config already exists for this client
    let config = await SystemConfig.findOne({ clientId });

    if (config) {
      // Update existing config
      config = await SystemConfig.findOneAndUpdate(
        { clientId },
        { 
          mongoUri,
          ...otherConfig
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new config
      config = await SystemConfig.create({
        clientId,
        mongoUri,
        ...otherConfig
      });
    }

    // Return success with limited data (not revealing full MongoDB URI)
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

    const config = await SystemConfig.findOne({ clientId });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: `Configuration not found for client: ${clientId}`
      });
    }

    // Return configuration with masked MongoDB URI for security
    const configResponse = {
      ...config.toObject(),
      mongoUri: config.mongoUri ? '******' : null // Mask the actual URI
    };

    return res.status(200).json({
      success: true,
      data: configResponse
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
 * Internal function to get MongoDB URI for a client
 * This is not exposed as an API endpoint but used internally
 */
exports.getClientMongoUri = async (clientId) => {
  try {
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    const config = await SystemConfig.findOne({ clientId });

    if (!config || !config.mongoUri) {
      throw new Error(`MongoDB URI not configured for client: ${clientId}`);
    }

    return config.mongoUri;
  } catch (error) {
    console.error(`Error retrieving MongoDB URI for client ${clientId}:`, error);
    throw error;
  }
};
