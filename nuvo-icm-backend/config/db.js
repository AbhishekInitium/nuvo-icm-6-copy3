
const mongoose = require('mongoose');
require('dotenv').config(); // Add this to ensure .env is loaded here too

// Default connection using environment variable
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MongoDB URI is not defined. Please check your .env file.');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Connect to a specific client's MongoDB
const connectClientDB = async (mongoUri) => {
  try {
    if (!mongoUri) {
      throw new Error('MongoDB URI is required');
    }
    
    // If already connected to this URI, return
    if (mongoose.connection.readyState === 1 && 
        mongoose.connection.client.s.url === mongoUri) {
      return mongoose.connection;
    }
    
    // If connected to a different URI, close current connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected to client database: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to client MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
module.exports.connectClientDB = connectClientDB;
