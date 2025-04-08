
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
    console.log('Attempting login with credentials:', {
      username: credentials.username, 
      role: credentials.role, 
      clientId: credentials.clientId
    });
    console.log('API client baseURL:', apiClient.defaults.baseURL);
    
    // Sending login request to backend at http://localhost:3000/auth/login
    // which will be proxied through /api/auth/login
    const response = await apiClient.post('/auth/login', credentials);
    
    console.log('Login response from backend:', response.data);
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
