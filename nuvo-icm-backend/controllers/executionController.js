const Scheme = require('../models/Scheme');
const ExecutionLog = require('../models/ExecutionLog');
const { getClientConfig } = require('../utils/clientLoader');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Run a scheme in simulation or production mode
 * @route   POST /api/execute/run
 * @access  Private
 */
exports.runScheme = async (req, res) => {
  // Create a base execution log to track execution even if there's a failure
  let executionLog = {
    schemeId: null,
    mode: null,
    clientId: null,
    summary: {
      totalAgents: 0,
      passed: 0,
      failed: 0,
      totalCommission: 0
    },
    agents: [],
    postProcessingLog: null,
    error: null
  };
  
  // Log execution start
  console.log(`Execution started: ${new Date().toISOString()}`);
  
  try {
    const { schemeId, mode, clientId } = req.body;
    console.log(`Executing scheme: ${schemeId} for client: ${clientId} at: ${new Date().toISOString()}`);

    // Update the execution log with the initial request data
    executionLog.schemeId = schemeId;
    executionLog.mode = mode;
    executionLog.clientId = clientId;

    if (!clientId) {
      throw new Error('Client ID is required');
    }

    if (!schemeId) {
      throw new Error('Scheme ID is required');
    }

    if (!mode || !['simulation', 'production'].includes(mode)) {
      throw new Error('Valid mode (simulation or production) is required');
    }

    // Validate clientId using the clientLoader
    try {
      getClientConfig(clientId);
    } catch (error) {
      throw new Error(error.message);
    }

    // Find the scheme
    const scheme = await Scheme.findOne({ schemeId, clientId });
    
    if (!scheme) {
      throw new Error(`Scheme with ID ${schemeId} not found for client ${clientId}`);
    }

    // Validate scheme status for production runs
    if (mode === 'production' && scheme.status === 'ProdRun') {
      throw new Error('This scheme has already been run in production mode');
    }

    // Simulate execution with dummy data
    // In a real implementation, this would fetch data from SAP or other sources
    // based on the scheme's configuration
    const dummyAgents = generateDummyAgents(10);
    let executionResults = executeDummyLogic(dummyAgents, scheme);
    
    // Update execution log with results
    executionLog.agents = executionResults;
    executionLog.summary = {
      totalAgents: executionResults.length,
      passed: executionResults.filter(agent => agent.qualified).length,
      failed: executionResults.filter(agent => !agent.qualified).length,
      totalCommission: executionResults.reduce((total, agent) => total + agent.commission, 0)
    };

    // Check if the scheme has a post-processor plugin
    if (scheme.postProcessor) {
      try {
        // Construct the absolute path to the plugin
        const pluginPath = path.join(__dirname, '..', 'custom', scheme.postProcessor);
        
        // Check if the plugin file exists
        if (fs.existsSync(pluginPath)) {
          // Dynamically load the plugin
          const plugin = require(pluginPath);
          
          // Create a context object for the plugin
          const context = {
            schemeId: scheme.schemeId,
            mode,
            clientId,
            timestamp: new Date(),
            scheme: scheme.toObject()
          };
          
          // Execute the post-processor plugin
          const postProcessResult = await plugin(executionLog, context);
          
          // Update the execution log with the post-processed result
          executionLog = postProcessResult;
          
          // Log success
          executionLog.postProcessingLog = {
            status: 'success',
            message: `Post-processing completed successfully with plugin: ${scheme.postProcessor}`,
            timestamp: new Date()
          };
        } else {
          // Log plugin file not found error
          executionLog.postProcessingLog = {
            status: 'error',
            message: `Post-processor plugin file not found: ${scheme.postProcessor}`,
            timestamp: new Date()
          };
        }
      } catch (error) {
        // Log post-processing error
        executionLog.postProcessingLog = {
          status: 'error',
          message: `Post-processing error: ${error.message}`,
          stack: error.stack,
          timestamp: new Date()
        };
      }
    }

    // Save the execution log
    const savedLog = await ExecutionLog.create(executionLog);

    // If production mode, update scheme status
    if (mode === 'production') {
      scheme.status = 'ProdRun';
      await scheme.save();
    }

    console.log(`Execution completed successfully: ${savedLog.runId}`);

    return res.status(200).json({
      success: true,
      data: {
        runId: savedLog.runId,
        summary: savedLog.summary,
        mode: savedLog.mode,
        postProcessingStatus: savedLog.postProcessingLog ? savedLog.postProcessingLog.status : null
      }
    });

  } catch (error) {
    console.error('Error running scheme:', error);
    
    // Record error details in the execution log
    executionLog.error = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    };
    
    try {
      // Save the failed execution log to track the error
      const savedLog = await ExecutionLog.create(executionLog);
      console.log(`Execution failed, error logged with runId: ${savedLog.runId}`);
      
      return res.status(500).json({
        success: false,
        error: error.message,
        runId: savedLog.runId
      });
    } catch (logError) {
      console.error('Error saving execution log:', logError);
      return res.status(500).json({
        success: false,
        error: error.message,
        logError: 'Failed to save execution log'
      });
    }
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
      .select('runId schemeId mode executedAt summary postProcessingLog')
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

// Fix: Export all the controller functions properly
module.exports = {
  runScheme: exports.runScheme,
  getAllExecutionLogs: exports.getAllExecutionLogs,
  getExecutionLogById: exports.getExecutionLogById
};
