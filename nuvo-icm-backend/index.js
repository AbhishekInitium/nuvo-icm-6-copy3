
const express = require('express');
const connectDB = require('./config/db');
const healthRoutes = require('./routes/health.routes');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api', healthRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to NUVO ICM Backend API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
