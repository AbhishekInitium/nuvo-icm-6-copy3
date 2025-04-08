
const express = require('express');
const router = express.Router();
const { connectClientDb } = require('../utils/clientConnection');
const mongoose = require('mongoose');
const UserSchema = require('../models/UserSchema');

// Seed initial users for testing/development
async function seedUsers(User) {
  const users = [
    {
      username: 'admin_user',
      password: 'admin123',
      role: 'Admin',
      clientId: 'NUVO_01'
    },
    {
      username: 'manager_user',
      password: 'manager123',
      role: 'Manager',
      clientId: 'NUVO_01'
    },
    {
      username: 'agent_user',
      password: 'agent123',
      role: 'Agent',
      clientId: 'NUVO_01'
    },
    {
      username: 'finance_user',
      password: 'finance123',
      role: 'Finance',
      clientId: 'NUVO_01'
    }
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ 
      username: userData.username, 
      clientId: userData.clientId 
    });

    if (!existingUser) {
      await User.create(userData);
      console.log(`Seeded user: ${userData.username}`);
    }
  }
}

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
      clientDb.model('User', UserSchema);
    }
    
    // Get User model for this client connection
    const User = clientDb.model('User');
    
    // Ensure users are seeded for initial setup
    await seedUsers(User);
    
    // Find user
    const user = await User.findOne({ username, clientId });
    
    // If user doesn't exist
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
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
        clientId: user.clientId
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
