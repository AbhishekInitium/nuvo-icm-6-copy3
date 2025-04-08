
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

// Base axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding client ID
apiClient.interceptors.request.use((config) => {
  // Get clientId from localStorage if available
  const storedUser = localStorage.getItem("auth_user");
  const clientId = storedUser ? JSON.parse(storedUser).clientId : null;
  
  // Add client ID to all requests
  if (clientId) {
    if (config.url?.includes('?')) {
      config.url = `${config.url}&clientId=${clientId}`;
    } else {
      config.url = `${config.url}?clientId=${clientId}`;
    }
  }
  
  return config;
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error cases, like 401, 403, etc.
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth-specific API endpoint
export const authApi = {
  login: async (username: string, password: string, clientId: string) => {
    try {
      const response = await apiClient.post('/auth/login', { 
        username, 
        password, 
        clientId 
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
};
