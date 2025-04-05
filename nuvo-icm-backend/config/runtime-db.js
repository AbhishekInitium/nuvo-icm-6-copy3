
const mongoose = require('mongoose');

// Cache the connection
let connection = null;

/**
 * Connect to MongoDB with a runtime-provided URI
 * @param {string} mongoUri - The MongoDB connection string
 * @returns {Promise<mongoose.Connection>} The MongoDB connection
 */
const connectToMongo = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("MongoDB URI is required");
  }

  // Return cached connection if exists
  if (connection) {
    return connection;
  }

  // Connect to MongoDB
  connection = await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✅ Connected to MongoDB at runtime");
  return connection;
};

module.exports = connectToMongo;
