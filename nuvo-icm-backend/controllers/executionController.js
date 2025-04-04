
const Scheme = require('../models/Scheme');
const ExecutionLog = require('../models/ExecutionLog');
const { getClientConfig } = require('../utils/clientLoader');

/**
 * @desc    Run a scheme in simulation or production mode
 * @route   POST /api/execute/run
 * @access  Private
 */
exports.runScheme = async (req, res) => {
  try {
    const { schemeId, mode, clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    if (!schemeId) {
      return res.status(400).json({ success: false, error: 'Scheme ID is required' });
    }

    if (!mode || !['simulation', 'production'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'Valid mode (simulation or production) is required' });
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

    // Validate scheme status for production runs
    if (mode === 'production' && scheme.status === 'ProdRun') {
      return res.status(400).json({
        success: false,
        error: 'This scheme has already been run in production mode'
      });
    }

    // Simulate execution with dummy data
    // In a real implementation, this would fetch data from SAP or other sources
    // based on the scheme's configuration
    const dummyAgents = generateDummyAgents(10);
    const executionResults = executeDummyLogic(dummyAgents, scheme);
    
    // Create execution log
    const executionLog = await ExecutionLog.create({
      schemeId: scheme.schemeId,
      mode,
      clientId,
      summary: {
        totalAgents: executionResults.length,
        passed: executionResults.filter(agent => agent.qualified).length,
        failed: executionResults.filter(agent => !agent.qualified).length,
        totalCommission: executionResults.reduce((total, agent) => total + agent.commission, 0)
      },
      agents: executionResults
    });

    // If production mode, update scheme status
    if (mode === 'production') {
      scheme.status = 'ProdRun';
      await scheme.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        runId: executionLog.runId,
        summary: executionLog.summary,
        mode: executionLog.mode
      }
    });

  } catch (error) {
    console.error('Error running scheme:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get all execution logs for a client
 * @route   GET /api/execute/logs
 * @access  Private
 */
exports.getAllExecutionLogs = async (req, res) => {
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

    // Get execution logs
    const logs = await ExecutionLog.find({ clientId })
      .select('runId schemeId mode executedAt summary')
      .sort({ executedAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
    
  } catch (error) {
    console.error('Error fetching execution logs:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * @desc    Get a single execution log by runId
 * @route   GET /api/execute/log/:runId
 * @access  Private
 */
exports.getExecutionLogById = async (req, res) => {
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

    const log = await ExecutionLog.findOne({ runId, clientId });
    
    if (!log) {
      return res.status(404).json({
        success: false,
        error: `Execution log with ID ${runId} not found for client ${clientId}`
      });
    }

    return res.status(200).json({
      success: true,
      data: log
    });
    
  } catch (error) {
    console.error('Error fetching execution log:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Helper functions for dummy data generation and execution

/**
 * Generate dummy agent data for testing
 * @param {number} count - Number of agents to generate
 * @returns {Array} Array of dummy agent objects
 */
function generateDummyAgents(count) {
  const agents = [];
  
  for (let i = 1; i <= count; i++) {
    agents.push({
      agentId: `AGENT${i.toString().padStart(3, '0')}`,
      totalSales: Math.floor(Math.random() * 100000) + 50000,
      baseData: {
        region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
        productLine: ['Standard', 'Premium', 'Enterprise'][Math.floor(Math.random() * 3)],
        salesType: ['New', 'Renewal', 'Upsell'][Math.floor(Math.random() * 3)]
      }
    });
  }
  
  return agents;
}

/**
 * Execute dummy logic based on scheme configuration
 * @param {Array} agents - Array of agent objects
 * @param {Object} scheme - Scheme configuration object
 * @returns {Array} Array of processed agent objects with qualification and commission
 */
function executeDummyLogic(agents, scheme) {
  return agents.map(agent => {
    // Dummy qualification logic
    const qualifyingSales = agent.totalSales > 80000;
    
    // Sample qualifying criteria evaluations
    const qualifyingCriteria = [
      {
        rule: 'Minimum Sales Threshold',
        result: qualifyingSales,
        data: { threshold: 80000, actual: agent.totalSales }
      },
      {
        rule: 'Product Mix',
        result: agent.baseData.productLine === 'Premium',
        data: { required: 'Premium', actual: agent.baseData.productLine }
      }
    ];
    
    // Determine qualification (must pass all criteria)
    const qualified = qualifyingCriteria.every(criteria => criteria.result);
    
    // Calculate commission based on qualification
    const commission = qualified ? (agent.totalSales * 0.05) : 0;
    
    return {
      ...agent,
      qualified,
      commission,
      qualifyingCriteria,
      exclusions: [],
      adjustments: [],
      customLogic: [
        {
          rule: 'Business Rule Check',
          result: true,
          notes: 'All business rules satisfied'
        }
      ]
    };
  });
}

module.exports = {
  runScheme,
  getAllExecutionLogs,
  getExecutionLogById
};
