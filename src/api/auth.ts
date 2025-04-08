
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
    
    // Use expanded error handling
    const response = await apiClient.post('/auth/login', credentials);
    
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // More detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Authentication failed' 
    };
  }
};
