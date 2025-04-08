
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Login controller
 * Authenticates user against the main MongoDB
 */
exports.login = async (req, res) => {
  const { username, role, clientId } = req.body;

  console.log('Login attempt:', { username, role, clientId });

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
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected during login');
    }

    // Find user in the users collection
    const user = await mongoose.connection.db.collection('users').findOne({ 
      username: username,
      role: role,
      clientId: clientId
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
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};
