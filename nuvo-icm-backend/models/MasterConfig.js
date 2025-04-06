
const mongoose = require('mongoose');

/**
 * Master System Configuration Schema for multi-client MongoDB setup
 */
const MasterConfigSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: [true, 'Client ID is required'],
    unique: true,
    trim: true
  },
  mongoUri: {
    type: String,
    required: [true, 'MongoDB URI is required'],
    trim: true
  },
  setupComplete: {
    type: Boolean,
    default: false
  },
  collections: {
    schemes: String,
    executionlogs: String,
    kpiconfigs: String,
    systemconfigs: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Force the collection name to be master_systemconfigs
module.exports = mongoose.model('MasterConfig', MasterConfigSchema, 'master_systemconfigs');
