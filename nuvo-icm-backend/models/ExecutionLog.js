
const mongoose = require('mongoose');

/**
 * Schema for Execution Logs in the NUVO ICM system
 * Stores results of scheme executions in simulation or production mode
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
      required: [true, 'Scheme ID is required']
    },
    mode: {
      type: String,
      enum: ['simulation', 'production'],
      required: [true, 'Execution mode is required']
    },
    executedAt: {
      type: Date,
      default: Date.now
    },
    clientId: {
      type: String,
      required: [true, 'Client ID is required']
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
    agents: [
      {
        agentId: {
          type: String,
          required: true
        },
        totalSales: {
          type: Number,
          default: 0
        },
        qualified: {
          type: Boolean,
          default: false
        },
        commission: {
          type: Number,
          default: 0
        },
        baseData: {
          type: Object,
          default: {}
        },
        qualifyingCriteria: [
          {
            rule: {
              type: String,
              required: true
            },
            result: {
              type: Boolean,
              default: false
            },
            data: {
              type: Object,
              default: {}
            }
          }
        ],
        exclusions: {
          type: Array,
          default: []
        },
        adjustments: {
          type: Array,
          default: []
        },
        customLogic: [
          {
            rule: {
              type: String,
              required: true
            },
            result: {
              type: Boolean,
              default: false
            },
            notes: {
              type: String,
              default: ''
            }
          }
        ]
      }
    ],
    postProcessingLog: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Generate a unique run ID in the format RUN_DDMMYY_TIMESTAMP
 */
ExecutionLogSchema.pre('save', function(next) {
  if (!this.isNew) {
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
