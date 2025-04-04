
# NUVO ICM Backend

A comprehensive SaaS-based Incentive Compensation Management (ICM) system with multi-portal architecture, built with Node.js, Express, and MongoDB.

## Project Overview

NUVO ICM is a modular incentive compensation management platform designed for enterprise clients. Key features include:

- **Multi-tenant Architecture**: Serve multiple clients from a single deployment
- **Multi-portal Design**: Separate interfaces for different user roles
  - Manager Portal: For creating and configuring incentive schemes
  - Agent Portal: For viewing individual performance and compensation
  - Operations/Finance Portal: For approving schemes and analyzing results
  - Integration Portal: For configuring SAP and other data sources
- **MongoDB Database**: Efficient document storage in NUVO_ICM_2 database
- **Customizable Calculation Engine**: Support for complex incentive schemes
- **Plugin Architecture**: Extend functionality with custom post-processing plugins
- **SAP BTP Ready**: Designed to integrate with SAP Business Technology Platform

## Folder Structure

```
/
├── config/         # Configuration files including client configurations
├── controllers/    # API controllers organized by portal/functionality
├── models/         # MongoDB schema definitions
├── routes/         # API route definitions
├── services/       # Business logic services
├── utils/          # Utility functions for common operations
├── custom/         # Custom post-processing plugins
├── .env            # Environment variables
├── index.js        # Application entry point
└── package.json    # Project metadata and dependencies
```

### Directory Details

- **config/**: Contains database connection setup and client-specific configurations
- **controllers/**: Implements the business logic for API endpoints, separated by portal
- **models/**: MongoDB schema definitions for Schemes, KPI configurations, execution logs, etc.
- **routes/**: Express route definitions that map HTTP requests to controller functions
- **services/**: Shared business logic not directly tied to API endpoints
- **utils/**: Helper functions like client configuration loading and validation
- **custom/**: Client-specific plugins for post-processing execution results

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nuvo-icm-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/NUVO_ICM_2
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **For production deployment**
   ```bash
   npm start
   ```

## API Endpoints

### Manager Portal (`/api/manager/*`)
- `GET /api/manager/schemes?clientId=xxx`: List all schemes for a client
- `POST /api/manager/schemes`: Create a new incentive scheme
- `GET /api/manager/available-configs?clientId=xxx`: Get available configurations for scheme creation

### Agent Portal (`/api/agent/*`)
- `GET /api/agent/schemes?clientId=xxx&agentId=yyy`: Get list of schemes where the agent has participated
- `GET /api/agent/scheme/:schemeId/result?agentId=yyy`: Get agent-specific result from the most recent execution

### Operations/Finance Portal (`/api/ops/*`)
- `GET /api/ops/schemes?clientId=xxx`: List all schemes not in DRAFT status
- `PUT /api/ops/scheme/:schemeId/approve`: Mark a scheme as APPROVED
- `GET /api/ops/production-runs?clientId=xxx`: List all production execution logs
- `GET /api/ops/production-run/:runId`: Get full run result with summary and per-agent logs

### Integration Portal (`/api/integration/*`)
- `POST /api/integration/config`: Save or update system configuration
- `GET /api/integration/config?clientId=xxx`: Get system configuration by client ID

### Execution Engine (`/api/execute/*`)
- `POST /api/execute/run`: Run a scheme in simulation or production mode
- `GET /api/execute/logs?clientId=xxx`: Get all execution logs for a client
- `GET /api/execute/log/:runId`: Get a single execution log by runId

### Admin Configuration (`/api/admin/*`)
- `GET /api/admin/configs?clientId=xxx`: Get all admin configurations for a client
- `GET /api/admin/config/:adminName?clientId=xxx`: Get a single admin configuration by name

### System Health (`/api/*`)
- `GET /api/health?clientId=xxx`: Basic health check with optional client validation
- `GET /api/system/diagnostics`: Full system diagnostics including database and client configurations

## Client Configuration

The system uses a client configuration model where each tenant has specific settings for database collections and SAP connectivity. These configurations are defined in `config/clients.js`.

Example client configuration:
```javascript
{
  clientId: "client_001",
  sapSystemId: "PRD",
  sapBaseUrl: "https://sap-api.example.com/client1",
  sapCredentials: {
    user: "sapuser1",
    password: "password1" // In production, use environment variables
  },
  mongoCollectionsPrefix: "client1_"
}
```

## Custom Post-Processing Plugins

The system supports custom post-processing plugins that can modify execution results before they are saved. Plugins are stored in the `custom/` directory and are loaded dynamically during execution.

See `custom/README.md` for plugin development details.

## Future Enhancements

### TODO: SAP API Integration
- Implement SAP API connector with destination service
- Support multiple SAP API versions and authentication methods
- Add caching layer for SAP API responses

### TODO: System Integration UI
- Develop frontend for configuring data sources
- Add support for test connections to SAP
- Create visual mapping tools for KPIs

### TODO: Post-processing Plugin Registry
- Develop a registry for managing custom plugins
- Add support for versioning and rollback
- Implement plugin testing framework

### TODO: Authentication & Authorization
- Implement JWT or OAuth-based authentication
- Role-based access control for different portals
- Single sign-on integration with corporate identity providers

## License

Proprietary - All rights reserved

