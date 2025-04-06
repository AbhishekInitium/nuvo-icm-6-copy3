
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
  error?: string;
}

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
