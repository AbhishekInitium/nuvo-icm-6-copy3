
const mongoose = require('mongoose');

/**
 * Schema for execution logs of incentive scheme runs (simulation or production)
 */
const ExecutionLogSchema = new mongoose.Schema(
  {
    runId: {
      type: String,
      unique: true,
      required: true
    },
    schemeId: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      enum: ['simulation', 'production'],
      required: true
    },
    clientId: {
      type: String,
      required: true
    },
    summary: {
      totalAgents: {
        type: Number,
        default: 0
      },
      passed: {
        type: Number,
        default: 0
      },
      failed: {
        type: Number,
        default: 0
      },
      totalCommission: {
        type: Number,
        default: 0
      }
    },
    agents: [{
      agentId: String,
      qualified: Boolean,
      commission: Number,
      totalSales: Number,
      qualifyingCriteria: [{
        rule: String,
        result: Boolean,
        data: Object
      }],
      exclusions: [Object],
      adjustments: [Object],
      customLogic: [{
        rule: String,
        result: Boolean,
        notes: String
      }],
      baseData: Object
    }],
    postProcessingLog: {
      status: String,
      message: String,
      stack: String,
      timestamp: Date
    },
    executedAt: {
      type: Date,
      default: Date.now
    }
  }
);

/**
 * Generate a unique run ID in the format RUN_DDMMYY_TIMESTAMP
 */
ExecutionLogSchema.pre('save', function(next) {
  if (this.runId) {
    return next();
  }
  
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).substring(2);
  const timestamp = Date.now();
  
  this.runId = `RUN_${day}${month}${year}_${timestamp}`;
  next();
});

module.exports = mongoose.model('ExecutionLog', ExecutionLogSchema);
