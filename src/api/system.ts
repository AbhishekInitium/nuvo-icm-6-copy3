
import { apiClient } from './client';

export interface SystemConfigInput {
  clientId: string;
  mongoUri: string;
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

export interface KpiConfigInput {
  clientId: string;
  adminId: string;
  adminName: string;
  calculationBase: string;
  baseField: string;
  baseData?: any[];
  qualificationFields?: any[];
  adjustmentFields?: any[];
  exclusionFields?: any[];
  customRules?: any[];
}

export interface KpiConfigResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    adminName: string;
    clientId: string;
  };
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
    // Basic validation before sending request
    if (!mongoUri) {
      return {
        success: false,
        error: 'MongoDB URI is required'
      };
    }
    
    // Enhanced MongoDB URI format validation
    // This regex checks for mongodb:// or mongodb+srv:// followed by something before the first / (credentials and host)
    // then a database name (non-empty) followed by optional query parameters
    const uriPattern = /^mongodb(\+srv)?:\/\/[^\/]+\/[^?]+(\/|\?|$)/;
    if (!uriPattern.test(mongoUri)) {
      return {
        success: false,
        error: 'Invalid MongoDB URI format. Required format: mongodb[+srv]://username:password@host/database'
      };
    }
    
    // Check for common Atlas connection string errors
    if (mongoUri.includes('@.') || mongoUri.includes('@/')) {
      return {
        success: false,
        error: 'Invalid MongoDB URI: Missing hostname or incorrect format after the @ symbol'
      };
    }
    
    const response = await apiClient.post('/system/test-connection', { mongoUri });
    return response.data;
  } catch (error) {
    console.error('API Error during connection test:', error);
    
    // Detailed error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return { 
        success: false, 
        error: error.response.data?.error || 'Connection test failed: Server error' 
      };
    } else if (error.request) {
      // The request was made but no response was received
      return { 
        success: false, 
        error: 'Connection test failed: No response from server. Is the backend running?' 
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return { 
        success: false, 
        error: error.message || 'Connection test failed: Request error'
      };
    }
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
    const response = await apiClient.post('/integration/config', config);
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
 * Save KPI configuration to client database
 */
export const saveKpiConfig = async (config: KpiConfigInput): Promise<KpiConfigResponse> => {
  try {
    const response = await apiClient.post('/integration/kpi-config', config);
    return response.data;
  } catch (error) {
    console.error('API Error during save KPI config:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Save KPI configuration failed: Network error'
    };
  }
};

/**
 * Get all KPI configurations for a client
 */
export const getKpiConfigs = async (clientId: string): Promise<any> => {
  try {
    const response = await apiClient.get('/integration/kpi-configs', {
      params: { clientId }
    });
    return response.data;
  } catch (error) {
    console.error('API Error getting KPI configs:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Get KPI configurations failed: Network error'
    };
  }
};

/**
 * Get a specific KPI configuration by ID
 */
export const getKpiConfigById = async (id: string, clientId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/integration/kpi-config/${id}`, {
      params: { clientId }
    });
    return response.data;
  } catch (error) {
    console.error('API Error getting KPI config:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Get KPI configuration failed: Network error'
    };
  }
};

/**
 * Delete a KPI configuration
 */
export const deleteKpiConfig = async (id: string, clientId: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/integration/kpi-config/${id}`, {
      params: { clientId }
    });
    return response.data;
  } catch (error) {
    console.error('API Error deleting KPI config:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Delete KPI configuration failed: Network error'
    };
  }
};

/**
 * Get system configuration (MongoDB URI will be masked)
 */
export const getSystemConfig = async (clientId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/integration/config`, {
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
