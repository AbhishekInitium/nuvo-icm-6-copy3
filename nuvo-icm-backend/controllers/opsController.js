
const schemeService = require('../services/schemeService');
const executionLogService = require('../services/executionLogService');

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

    // Call the service method
    const schemes = await schemeService.getApprovedSchemes(clientId);
    
    return res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes
    });
    
  } catch (error) {
    console.error('Error fetching approved schemes:', error);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message || 'Server Error'
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
    const { clientId, notes } = req.body;

    // Call the service method
    const scheme = await schemeService.approveScheme(schemeId, clientId, notes);
    
    return res.status(200).json({
      success: true,
      data: scheme
    });
    
  } catch (error) {
    console.error('Error approving scheme:', error);
    
    // Determine appropriate status code based on error message
    let statusCode = 500;
    if (error.message.includes('not found')) statusCode = 404;
    if (error.message.includes('must be in DRAFT status')) statusCode = 400;
    if (error.message.includes('Client ID is required')) statusCode = 400;
    
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Server Error'
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

    // Call the service method
    const productionRuns = await executionLogService.getProductionRuns(clientId);
    
    return res.status(200).json({
      success: true,
      count: productionRuns.length,
      data: productionRuns
    });
    
  } catch (error) {
    console.error('Error fetching production runs:', error);
    
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message || 'Server Error'
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

    // Call the service method
    const result = await executionLogService.getProductionRunDetail(runId, clientId);
    
    return res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error fetching production run details:', error);
    
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};
