
const Scheme = require('../models/Scheme');
const ExecutionLog = require('../models/ExecutionLog');
const { getClientConfig } = require('../utils/clientLoader');

/**
 * @desc    Get all non-draft schemes for a client
 * @route   GET /api/ops/schemes
 * @access  Private
 */
exports.getApprovedSchemes = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    // Find all schemes for this client that are not in DRAFT status
    const schemes = await Scheme.find({ 
      clientId, 
      status: { $ne: 'Draft' } 
    });
    
    return res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes
    });
    
  } catch (error) {
    console.error('Error fetching approved schemes:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Approve a scheme (change status from DRAFT to APPROVED)
 * @route   PUT /api/ops/scheme/:schemeId/approve
 * @access  Private
 */
exports.approveScheme = async (req, res) => {
  try {
    const { schemeId } = req.params;
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    // Find the scheme
    const scheme = await Scheme.findOne({ schemeId, clientId });
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: `Scheme with ID ${schemeId} not found for client ${clientId}`
      });
    }

    // Check if the scheme is in DRAFT status
    if (scheme.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        error: `Scheme must be in DRAFT status to be approved. Current status: ${scheme.status}`
      });
    }

    // Update the scheme status to APPROVED
    scheme.status = 'Approved';
    
    // Log approval info (in a real implementation, this would come from auth middleware)
    scheme.approvalInfo = {
      approvedAt: new Date(),
      approvedBy: 'ops-user@example.com', // Mock user for now
      notes: req.body.notes || 'Approved by Operations'
    };
    
    // Save the updated scheme
    await scheme.save();
    
    return res.status(200).json({
      success: true,
      data: scheme
    });
    
  } catch (error) {
    console.error('Error approving scheme:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get all production execution logs for a client
 * @route   GET /api/ops/production-runs
 * @access  Private
 */
exports.getProductionRuns = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    // Find all production execution logs for this client
    const productionRuns = await ExecutionLog.find({ 
      clientId, 
      mode: 'production' 
    }).select('runId schemeId executedAt summary postProcessingLog');
    
    return res.status(200).json({
      success: true,
      count: productionRuns.length,
      data: productionRuns
    });
    
  } catch (error) {
    console.error('Error fetching production runs:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get detailed execution log for a specific production run
 * @route   GET /api/ops/production-run/:runId
 * @access  Private
 */
exports.getProductionRunDetail = async (req, res) => {
  try {
    const { runId } = req.params;
    const { clientId } = req.query;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({ success: false, error: error.message });
    }

    // Find the production run
    const productionRun = await ExecutionLog.findOne({ 
      runId, 
      clientId,
      mode: 'production'
    });
    
    if (!productionRun) {
      return res.status(404).json({
        success: false,
        error: `Production run with ID ${runId} not found for client ${clientId}`
      });
    }
    
    // Get the associated scheme data
    const scheme = await Scheme.findOne({ 
      schemeId: productionRun.schemeId, 
      clientId 
    });
    
    return res.status(200).json({
      success: true,
      data: {
        executionLog: productionRun,
        schemeInfo: scheme ? {
          name: scheme.name,
          description: scheme.description,
          effectiveStart: scheme.effectiveStart,
          effectiveEnd: scheme.effectiveEnd,
          quotaAmount: scheme.quotaAmount,
          revenueBase: scheme.revenueBase,
          configName: scheme.configName
        } : null
      }
    });
    
  } catch (error) {
    console.error('Error fetching production run details:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
