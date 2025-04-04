
const mongoose = require('mongoose');

/**
 * Schema for incentive schemes in the NUVO ICM system
 */
const SchemeSchema = new mongoose.Schema(
  {
    schemeId: {
      type: String,
      unique: true,
      required: true
    },
    name: {
      type: String,
      required: [true, 'Scheme name is required']
    },
    description: {
      type: String,
      default: ''
    },
    effectiveStart: {
      type: Date,
      required: [true, 'Effective start date is required']
    },
    effectiveEnd: {
      type: Date,
      required: [true, 'Effective end date is required']
    },
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Simulated', 'ProdRun'],
      default: 'Draft'
    },
    quotaAmount: {
      type: Number,
      default: 0
    },
    revenueBase: {
      type: Number,
      default: 0
    },
    configName: {
      type: String,
      required: [true, 'Config name is required']
    },
    rules: {
      type: Object,
      default: {
        qualifying: {},
        adjustment: {},
        exclusions: {},
        credit: {}
      }
    },
    payoutStructure: {
      type: Object,
      default: {}
    },
    customRules: {
      type: Array,
      default: []
    },
    clientId: {
      type: String,
      required: [true, 'Client ID is required']
    },
    postProcessor: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Generate a unique scheme ID in the format ICM_DDMMYY_TIMESTAMP
 */
SchemeSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next();
  }
  
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).substring(2);
  const timestamp = Date.now();
  
  this.schemeId = `ICM_${day}${month}${year}_${timestamp}`;
  next();
});

module.exports = mongoose.model('Scheme', SchemeSchema);
