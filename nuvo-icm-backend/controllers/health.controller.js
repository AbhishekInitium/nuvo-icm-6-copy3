
/**
 * Health check controller
 */
exports.healthCheck = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy and running',
    timestamp: new Date()
  });
};
