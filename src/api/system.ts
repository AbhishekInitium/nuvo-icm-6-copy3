
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

export interface ConnectionStatusResponse {
  success: boolean;
  data?: {
    clientId?: string;
    connected: boolean;
    readyState: number;
  };
  error?: string;
}

/**
 * Test MongoDB connection
 */
export const testConnection = async (mongoUri: string): Promise<ConnectionTestResponse> => {
  try {
    // Simple client-side validation of MongoDB URI format
    if (!mongoUri.match(/^mongodb(\+srv)?:\/\//)) {
      return { 
        success: false, 
        error: 'Invalid MongoDB URI format. URI must start with mongodb:// or mongodb+srv://'
      };
    }

    // Check for common formatting errors
    if (mongoUri.includes('@.')) {
      return { 
        success: false, 
        error: 'Invalid MongoDB URI format: missing cluster name after the @ symbol'
      };
    }

    const response = await apiClient.post('/system/test-connection', { mongoUri });
    return response.data;
  } catch (error: any) {
    console.error('API Error during connection test:', error);
    
    // Extract error message from response if available
    const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Connection test failed: Network error';
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

/**
 * Set up client MongoDB collections
 */
export const setupConnection = async (clientId: string, mongoUri: string): Promise<SetupConnectionResponse> => {
  try {
    const response = await apiClient.post('/system/set-connection', { clientId, mongoUri });
    return response.data;
  } catch (error) {
    console.error('API Error during setup:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Setup connection failed: Network error'
    };
  }
};

/**
 * Save system configuration including MongoDB URI
 */
export const saveSystemConfig = async (config: SystemConfigInput): Promise<SystemConfigResponse> => {
  try {
    const response = await apiClient.post('/system/config', config);
    return response.data;
  } catch (error) {
    console.error('API Error during save config:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Save configuration failed: Network error'
    };
  }
};

/**
 * Get system configuration (MongoDB URI will be masked)
 */
export const getSystemConfig = async (clientId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/system/config`, {
      params: { clientId }
    });
    return response.data;
  } catch (error) {
    console.error('API Error during get config:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Get configuration failed: Network error'
    };
  }
};

/**
 * Get connection status for a specific client or all clients
 */
export const getConnectionStatus = async (clientId?: string): Promise<ConnectionStatusResponse> => {
  try {
    const response = await apiClient.get('/system/connection-status', {
      params: clientId ? { clientId } : {}
    });
    return response.data;
  } catch (error) {
    console.error('API Error getting connection status:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Get connection status failed: Network error'
    };
  }
};
