
/**
 * Client configuration for the NUVO ICM application
 * Each client has specific settings for SAP connectivity and MongoDB collections
 */

const clients = [
  {
    clientId: "client_001",
    sapSystemId: "PRD",
    sapBaseUrl: "https://sap-api.example.com/client1",
    sapCredentials: {
      user: "sapuser1",
      password: "password1" // In production, use environment variables or secure vault
    },
    mongoCollectionsPrefix: "client1_",
    kpiApiMappings: [
      { kpiName: "sales", sourceField: "totalSales", sourceAPI: "/api/sales" },
      { kpiName: "inventory", sourceField: "stockLevel", sourceAPI: "/api/inventory" }
    ]
  },
  {
    clientId: "client_002",
    sapSystemId: "QAS",
    sapBaseUrl: "https://sap-api.example.com/client2",
    sapCredentials: {
      user: "sapuser2",
      password: "password2" // In production, use environment variables or secure vault
    },
    mongoCollectionsPrefix: "client2_",
    kpiApiMappings: [
      { kpiName: "sales", sourceField: "revenue", sourceAPI: "/api/revenue" },
      { kpiName: "production", sourceField: "outputVolume", sourceAPI: "/api/production" }
    ]
  },
  {
    clientId: "client_003",
    sapSystemId: "DEV",
    sapBaseUrl: "https://sap-api.example.com/client3",
    sapCredentials: {
      user: "sapuser3",
      password: "password3" // In production, use environment variables or secure vault
    },
    mongoCollectionsPrefix: "client3_",
    kpiApiMappings: [
      { kpiName: "efficiency", sourceField: "productionEfficiency", sourceAPI: "/api/efficiency" },
      { kpiName: "quality", sourceField: "defectRate", sourceAPI: "/api/quality" }
    ]
  }
];

module.exports = clients;
