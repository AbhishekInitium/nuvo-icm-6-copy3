
const mongoose = require('mongoose');

/**
 * System Configuration Schema for External API Integration
 */
const SystemConfigSchema = new mongoose.Schema({
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
  kpiApiMappings: [
    {
      kpiName: {
        type: String,
        required: [true, 'KPI Name is required'],
        trim: true
      },
      sourceType: {
        type: String,
        enum: ['External'],
        required: [true, 'Source Type is required']
      },
      sourceField: {
        type: String,
        required: [true, 'Source Field is required'],
        trim: true
      },
      apiEndpoint: {
        type: String,
        trim: true
      },
      expectedFileColumn: {
        type: String,
        trim: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SystemConfig', SystemConfigSchema);
