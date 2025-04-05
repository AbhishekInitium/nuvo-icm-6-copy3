
const mongoose = require('mongoose');
require('dotenv').config(); // Add this to ensure .env is loaded here too

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

module.exports = connectDB;
