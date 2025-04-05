
const ExecutionLog = require('../models/ExecutionLog');
const Scheme = require('../models/Scheme');
const { getClientConfig } = require('../utils/clientLoader');

/**
 * @desc    Get list of schemes where the agent has participated
 * @route   GET /api/agent/schemes?agentId=xxx&clientId=xxx
 * @access  Private
 */
exports.getAgentSchemes = async (req, res) => {
  try {
    const { agentId, clientId } = req.query;

    if (!agentId || !clientId) {
      return res.status(400).json({
        success: false,
        error: 'Agent ID and Client ID are required'
      });
    }

    // Validate clientId using clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    // Query ExecutionLog collection to find all logs where this agent is present
    const executionLogs = await ExecutionLog.find({
      clientId,
      'agents.agentId': agentId
    }).sort({ executedAt: -1 });

    // Create a map to store unique schemes with their latest execution
    const uniqueSchemes = new Map();

    // Process logs to extract unique schemes
    executionLogs.forEach((log) => {
      if (!uniqueSchemes.has(log.schemeId)) {
        uniqueSchemes.set(log.schemeId, {
          schemeId: log.schemeId,
          runId: log.runId,
          mode: log.mode,
          executedAt: log.executedAt
        });
      }
    });

    // Get scheme details for each unique scheme
    const schemeDetails = await Promise.all(
      Array.from(uniqueSchemes.values()).map(async (scheme) => {
        const schemeInfo = await Scheme.findOne({ 
          schemeId: scheme.schemeId,
          clientId
        });
        
        return {
          ...scheme,
          schemeName: schemeInfo ? schemeInfo.name : 'Unknown Scheme',
          description: schemeInfo ? schemeInfo.description : '',
          effectiveStart: schemeInfo ? schemeInfo.effectiveStart : null,
          effectiveEnd: schemeInfo ? schemeInfo.effectiveEnd : null
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: schemeDetails.length,
      data: schemeDetails
    });
  } catch (error) {
    console.error('Error fetching agent schemes:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get agent-specific result from the most recent execution log
 * @route   GET /api/agent/scheme/:schemeId/result?agentId=xxx&clientId=xxx
 * @access  Private
 */
exports.getAgentResultForScheme = async (req, res) => {
  try {
    const { schemeId } = req.params;
    const { agentId, clientId } = req.query;

    if (!agentId || !clientId) {
      return res.status(400).json({
        success: false,
        error: 'Agent ID and Client ID are required'
      });
    }

    // Validate clientId using clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    // Get the scheme details
    const scheme = await Scheme.findOne({ schemeId, clientId });
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: `Scheme with ID ${schemeId} not found for client ${clientId}`
      });
    }

    // Get the most recent execution log for this scheme
    const executionLog = await ExecutionLog.findOne({
      schemeId,
      clientId
    }).sort({ executedAt: -1 });

    if (!executionLog) {
      return res.status(404).json({
        success: false,
        error: `No execution logs found for scheme ${schemeId}`
      });
    }

    // Find the agent's result in the execution log
    const agentResult = executionLog.agents.find(
      (agent) => agent.agentId === agentId
    );

    if (!agentResult) {
      return res.status(404).json({
        success: false,
        error: `Agent ${agentId} not found in execution log for scheme ${schemeId}`
      });
    }

    // Prepare the response with metadata
    const result = {
      agentId: agentResult.agentId,
      schemeId: executionLog.schemeId,
      schemeName: scheme.name,
      runId: executionLog.runId,
      executedAt: executionLog.executedAt,
      mode: executionLog.mode,
      qualified: agentResult.qualified,
      commission: agentResult.commission,
      totalSales: agentResult.totalSales,
      baseData: agentResult.baseData,
      qualifyingCriteria: agentResult.qualifyingCriteria,
      exclusions: agentResult.exclusions,
      adjustments: agentResult.adjustments,
      customLogic: agentResult.customLogic
    };

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching agent result for scheme:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Fix: Use the exports object directly instead of trying to export functions that aren't defined
module.exports = exports;
