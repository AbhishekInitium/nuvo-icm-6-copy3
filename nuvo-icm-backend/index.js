
const express = require('express');
require('dotenv').config(); // Ensure this is at the top to load env variables first
const connectDB = require('./config/db');
const healthRoutes = require('./routes/health.routes');
const managerRoutes = require('./routes/managerRoutes');
const adminConfigRoutes = require('./routes/adminConfigRoutes');
const executionRoutes = require('./routes/executionRoutes');
const agentRoutes = require('./routes/agentRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const opsRoutes = require('./routes/opsRoutes');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminConfigRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/integration', integrationRoutes);
app.use('/api/ops', opsRoutes);

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
