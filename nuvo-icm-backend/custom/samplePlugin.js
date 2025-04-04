
/**
 * Sample post-processor plugin for the NUVO ICM system
 * This plugin demonstrates how to modify execution results or trigger external actions
 * 
 * @param {Object} executionLog - The execution log object with results
 * @param {Object} context - Contextual information about the execution
 * @returns {Object} Modified execution log
 */
module.exports = async function(executionLog, context) {
  console.log(`Post-processing started for scheme: ${context.schemeId} in ${context.mode} mode`);
  
  try {
    // Clone the execution log to avoid modifying the input directly
    const result = JSON.parse(JSON.stringify(executionLog));
    
    // Example: Add a bonus to all qualified agents
    if (result.agents && result.agents.length > 0) {
      let totalBonus = 0;
      
      result.agents.forEach(agent => {
        if (agent.qualified) {
          // Add a 10% bonus to all qualified agents
          const bonus = agent.commission * 0.1;
          agent.commission += bonus;
          totalBonus += bonus;
          
          // Add a note about the bonus
          agent.customLogic.push({
            rule: 'Post-processing Bonus',
            result: true,
            notes: `Added 10% bonus: $${bonus.toFixed(2)}`
          });
        }
      });
      
      // Update the summary
      result.summary.totalCommission += totalBonus;
      
      // Add metadata about the post-processing
      result.postProcessingLog = {
        status: 'success',
        message: `Applied 10% bonus to all qualified agents, total bonus: $${totalBonus.toFixed(2)}`,
        appliedAt: new Date(),
        totalBonus: totalBonus
      };
      
      // Example: You could also trigger external systems here
      // await sendToExternalSystem(result.summary);
    }
    
    console.log('Post-processing completed successfully');
    return result;
    
  } catch (error) {
    console.error('Error in post-processing plugin:', error);
    
    // Return the original execution log with error information
    executionLog.postProcessingLog = {
      status: 'error',
      message: `Plugin error: ${error.message}`,
      timestamp: new Date()
    };
    
    return executionLog;
  }
};

/**
 * Example of how to send data to an external system
 * This is just a placeholder function to demonstrate the concept
 */
async function sendToExternalSystem(data) {
  // This would be an API call to an external system
  console.log('Sending data to external system:', data);
  
  // Simulate an API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('Data sent to external system');
  return true;
}
