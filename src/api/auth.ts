
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
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Authentication failed' 
    };
  }
};
