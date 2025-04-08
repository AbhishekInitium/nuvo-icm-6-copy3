
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Login controller
 * Authenticates user against the main MongoDB
 */
exports.login = async (req, res) => {
  const { username, role, clientId } = req.body;

  console.log('Login attempt:', { username, role, clientId });
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Is set (value hidden)' : 'Not set');
  console.log('Current MongoDB connection state:', mongoose.connection.readyState);

  if (!username || !role || !clientId) {
    console.log('Missing required fields:', { username, role, clientId });
    return res.status(400).json({
      success: false,
      error: 'Please provide username, role and clientId'
    });
  }

  try {
    // Connect to the main MongoDB database (not client-specific)
    const db = mongoose.connection;
    
    // Check connection status
    if (db.readyState !== 1) {
      console.error('MongoDB not connected. Current state:', db.readyState);
      return res.status(500).json({
        success: false,
        error: 'Database connection not established'
      });
    }

    // Get the users collection
    const usersCollection = db.collection('users');
    
    console.log('Searching for user:', username);
    
    // Find user by username
    const user = await usersCollection.findOne({ username });
    
    console.log('User found in DB:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Found user data (excluding sensitive fields):', {
        username: user.username,
        role: user.role,
        clientId: user.clientId
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or role'
      });
    }
    
    // Check if role matches
    console.log('Checking role:', { userRole: user.role, providedRole: role });
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        error: 'Invalid role for this user'
      });
    }
    
    // Check if client ID matches
    console.log('Checking clientId:', { userClientId: user.clientId, providedClientId: clientId });
    if (user.clientId !== clientId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid client ID for this user'
      });
    }
    
    // Authentication successful
    console.log('Authentication successful for user:', username);
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
