
import { apiClient } from './client';

export interface SystemConfigInput {
  clientId: string;
  mongoUri: string;
  sapSystemId?: string;
  sapBaseUrl?: string;
  sapUsername?: string;
  sapPassword?: string;
}

export interface SystemConfigResponse {
  success: boolean;
  message?: string;
  data?: {
    clientId: string;
    status: string;
    timestamp: string;
  };
  setupComplete?: boolean;
  error?: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SetupConnectionResponse {
  success: boolean;
  message?: string;
  data?: {
    clientId: string;
    collections: {
      schemes: string;
      executionlogs: string;
      kpiconfigs: string;
      systemconfigs: string;
    };
    setupComplete: boolean;
    createdAt: string;
  };
  error?: string;
}

/**
 * Test MongoDB connection
 */
export const testConnection = async (mongoUri: string): Promise<ConnectionTestResponse> => {
  const response = await apiClient.post('/system/test-connection', { mongoUri });
  return response.data;
};

/**
 * Set up client MongoDB collections
 */
export const setupConnection = async (clientId: string, mongoUri: string): Promise<SetupConnectionResponse> => {
  const response = await apiClient.post('/system/set-connection', { clientId, mongoUri });
  return response.data;
};

/**
 * Save system configuration including MongoDB URI
 */
export const saveSystemConfig = async (config: SystemConfigInput): Promise<SystemConfigResponse> => {
  const response = await apiClient.post('/system/config', config);
  return response.data;
};

/**
 * Get system configuration (MongoDB URI will be masked)
 */
export const getSystemConfig = async (clientId: string): Promise<any> => {
  const response = await apiClient.get(`/system/config`);
  return response.data;
};
