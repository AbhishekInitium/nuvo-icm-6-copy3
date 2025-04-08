
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Login controller
 * Authenticates user against the main MongoDB
 */
exports.login = async (req, res) => {
  const { username, role, clientId } = req.body;

  console.log('Login attempt:', { username, role, clientId });
  console.log('MongoDB Connection State:', mongoose.connection.readyState);
  console.log('MongoDB URI Environment Variable:', process.env.MONGODB_URI ? 'Exists (value hidden)' : 'Missing');

  if (!username || !role || !clientId) {
    return res.status(400).json({
      success: false,
      error: 'Please provide username, role and clientId'
    });
  }

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Current state:', mongoose.connection.readyState);
      try {
        console.log('Attempting to connect to MongoDB during login...');
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
          console.error('MONGODB_URI environment variable is not set!');
          return res.status(500).json({
            success: false,
            error: 'Database configuration missing'
          });
        }

        // Log sanitized URI (hide password)
        const sanitizedURI = mongoURI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@');
        console.log('Connecting to MongoDB with URI:', sanitizedURI);
        
        // Connect with options
        await mongoose.connect(mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully during login');
      } catch (connectionError) {
        console.error('Failed to connect to MongoDB:', connectionError);
        return res.status(500).json({
          success: false,
          error: 'Database connection failed'
        });
      }
    }

    // Mock authentication for testing in Lovable environment
    console.log('Using mock authentication for testing in Lovable environment');
    
    // Return a successful response with mock user data
    return res.status(200).json({
      success: true,
      user: {
        username: username.trim(),
        role: role.trim(),
        clientId: clientId.trim()
      },
      message: 'Authentication successful (Mock)'
    });
    
    /* 
    // Uncomment this section for real MongoDB authentication when database is properly configured
    
    // Find user in the users collection with trimmed values
    console.log('Looking up user with criteria:', { 
      username: username.trim(), 
      role: role.trim(), 
      clientId: clientId.trim() 
    });
    const user = await mongoose.connection.db.collection('users').findOne({ 
      username: username.trim(),
      role: role.trim(),
      clientId: clientId.trim()
    });
    
    console.log('User lookup result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Authentication successful
    return res.status(200).json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        clientId: user.clientId
      },
      message: 'Authentication successful'
    });
    */
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};
