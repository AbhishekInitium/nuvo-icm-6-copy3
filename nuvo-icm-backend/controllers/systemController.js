
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
      const timeoutPromise = new Promise((_, reject) => {
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
