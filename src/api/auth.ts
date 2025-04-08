
import { apiClient } from './client';
import { UserRole } from '@/contexts/AuthContext';

interface LoginCredentials {
  username: string;
  role: UserRole;
  clientId: string;
}

interface AuthResponse {
  success: boolean;
  user?: {
    username: string;
    role: UserRole;
    clientId: string;
  };
  message?: string;
  error?: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with credentials:', credentials);
    console.log('API client baseURL:', apiClient.defaults.baseURL);
    
    // Use expanded error handling
    const response = await apiClient.post('/auth/login', credentials);
    
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Authentication failed' 
    };
  }
};
