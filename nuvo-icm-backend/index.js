
require('dotenv').config(); // Ensure this is at the top to load env variables first
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const checkMongoHealth = require('./middleware/mongoHealthCheck');
const healthRoutes = require('./routes/health.routes');
const managerRoutes = require('./routes/managerRoutes');
const adminConfigRoutes = require('./routes/adminConfigRoutes');
const executionRoutes = require('./routes/executionRoutes');
const agentRoutes = require('./routes/agentRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const opsRoutes = require('./routes/opsRoutes');
const systemRoutes = require('./routes/systemRoutes');
const authRoutes = require('./routes/authRoutes');
const devRoutesSetup = require('./routes/devRoutes');

// Initialize Express
const app = express();

// Connect to MongoDB (just the master database for MasterConfig)
console.log(`MongoDB URI loaded: ${process.env.MONGODB_URI ? 'Yes (URI value hidden for security)' : 'No'}`);
connectDB();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:8081', 'https://preview--nuvo-icm-6-copy3.lovable.app', /\.lovable\.app$/],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);

// System configuration routes (before checkMongoHealth to allow setting up the DB)
app.use('/api/system', systemRoutes);

// Apply MongoDB health check middleware to all key routes
app.use('/api/manager', checkMongoHealth, managerRoutes);
app.use('/api/admin', checkMongoHealth, adminConfigRoutes);
app.use('/api/execute', checkMongoHealth, executionRoutes);
app.use('/api/agent', checkMongoHealth, agentRoutes);
app.use('/api/integration', checkMongoHealth, integrationRoutes);
app.use('/api/ops', checkMongoHealth, opsRoutes);

// Development routes - add last to capture all registered routes
app.use('/api/dev', devRoutesSetup(app));

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
  console.log(`CORS enabled for: http://localhost:8080, http://localhost:8081, and Lovable domains`);
});
