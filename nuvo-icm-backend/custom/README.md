
# Custom Post-Processor Plugins

This directory contains client-specific post-processor plugins for the NUVO ICM system.

## Plugin Structure

Each plugin should export a single async function with the following signature:

```javascript
module.exports = async function(executionLog, context) {
  // Process the execution log
  return modifiedExecutionLog;
}
```

## Parameters

- `executionLog`: The execution log object with all agent results
- `context`: Contextual information about the execution:
  - `schemeId`: The ID of the scheme being executed
  - `mode`: The execution mode ('simulation' or 'production')
  - `clientId`: The ID of the client
  - `timestamp`: The execution timestamp
  - `scheme`: The complete scheme configuration

## Return Value

The plugin should return the modified execution log object. This will be saved to the database.

## Error Handling

If the plugin throws an error, it will be caught and logged in the `postProcessingLog` field of the execution log.
