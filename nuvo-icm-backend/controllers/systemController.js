
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
