
/**
 * Middleware to check MongoDB connection health
 * Returns 503 Service Unavailable if MongoDB is not connected
 */
const mongoose = require('mongoose');

const checkMongoHealth = (req, res, next) => {
  // Check if MongoDB is connected (readyState === 1)
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "MongoDB is not connected."
    });
  }
  
  // If connected, proceed to the next middleware/route handler
  next();
};

module.exports = checkMongoHealth;
