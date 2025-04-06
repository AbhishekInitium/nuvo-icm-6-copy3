
const mongoose = require('mongoose');

/**
 * System Configuration Schema for SAP and External API Integration
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
  sapSystemId: {
    type: String,
    required: [true, 'SAP System ID is required'],
    trim: true
  },
  sapBaseUrl: {
    type: String,
    required: [true, 'SAP Base URL is required'],
    trim: true
  },
  sapDestinationName: {
    type: String,
    trim: true
  },
  sapUsername: {
    type: String,
    required: [true, 'SAP Username is required'],
    trim: true
  },
  sapPassword: {
    type: String,
    required: [true, 'SAP Password is required']
  },
  defaultCurrency: {
    type: String,
    default: 'USD',
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
        enum: ['SAP', 'External'],
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
