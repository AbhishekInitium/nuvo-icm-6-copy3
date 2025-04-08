
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
    const response = await apiClient.post('/auth/login', credentials);
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Authentication failed' 
    };
  }
};
