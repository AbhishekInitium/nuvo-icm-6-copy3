
const express = require('express');
const router = express.Router();
const { connectClientDb } = require('../utils/clientConnection');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Login route
router.post('/login', async (req, res) => {
  const { username, password, clientId } = req.body;
  
  if (!username || !password || !clientId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username, password and client ID are required' 
    });
  }
  
  try {
    // Connect to client's database
    const clientDb = await connectClientDb(clientId);
    
    // Check if User model exists for this client
    if (!clientDb.models.User) {
      // Create User schema if it doesn't exist
      const UserSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { 
          type: String, 
          enum: ['Admin', 'Manager', 'Agent', 'Finance'],
          default: 'Manager'
        },
        clientId: { type: String, required: true },
        email: { type: String },
        fullName: { type: String },
        active: { type: Boolean, default: true }
      });
      
      clientDb.model('User', UserSchema);
    }
    
    // Get User model for this client connection
    const User = clientDb.model('User');
    
    // Find user
    const user = await User.findOne({ username });
    
    // If user doesn't exist
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check if password matches (using plain comparison for now)
    // In a production environment, this should use bcrypt.compare
    const isMatch = user.password === password;
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check if user is active
    if (user.active === false) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is disabled, please contact your administrator' 
      });
    }
    
    // Return user data without password
    return res.status(200).json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        clientId: user.clientId,
        email: user.email,
        fullName: user.fullName
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication',
      error: error.message
    });
  }
});

module.exports = router;
