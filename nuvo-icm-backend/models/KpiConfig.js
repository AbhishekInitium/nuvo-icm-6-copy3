
const mongoose = require('mongoose');

/**
 * Schema for Admin-created KPI configurations in the NUVO ICM system
 */
const KpiConfigSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true
    },
    adminName: {
      type: String,
      required: [true, 'Admin configuration name is required'],
      unique: true
    },
    calculationBase: {
      type: String,
      required: [true, 'Calculation base is required']
    },
    baseField: {
      type: String,
      required: [true, 'Base field is required']
    },
    baseData: {
      type: Array,
      default: []
    },
    qualificationFields: {
      type: Array,
      default: []
    },
    adjustmentFields: {
      type: Array,
      default: []
    },
    exclusionFields: {
      type: Array,
      default: []
    },
    customRules: {
      type: Array,
      default: []
    },
    clientId: {
      type: String,
      required: [true, 'Client ID is required']
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure adminName is unique per clientId
KpiConfigSchema.index({ adminName: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('KpiConfig', KpiConfigSchema);
