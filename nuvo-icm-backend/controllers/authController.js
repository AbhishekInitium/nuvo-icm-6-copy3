
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Login controller
 * Authenticates user against the main MongoDB
 */
exports.login = async (req, res) => {
  const { username, role, clientId } = req.body;

  if (!username || !role || !clientId) {
    return res.status(400).json({
      success: false,
      error: 'Please provide username, role and clientId'
    });
  }

  try {
    // Connect to the main MongoDB database (not client-specific)
    const db = mongoose.connection;
    
    // Get the users collection
    const usersCollection = db.collection('users');
    
    // Find user by username
    const user = await usersCollection.findOne({ username });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or role'
      });
    }
    
    // Check if role matches
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        error: 'Invalid role for this user'
      });
    }
    
    // Check if client ID matches
    if (user.clientId !== clientId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid client ID for this user'
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
