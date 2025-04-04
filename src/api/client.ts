
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

// Base axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get current user information for requests
const getCurrentUser = () => {
  try {
    // Get from localStorage if not available through context
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Request interceptor for adding client ID
apiClient.interceptors.request.use((config) => {
  // Get user information
  const user = getCurrentUser();
  const clientId = user?.clientId || 'client_001';
  
  // Add client ID to all requests
  if (config.url?.includes('?')) {
    config.url = `${config.url}&clientId=${clientId}`;
  } else {
    config.url = `${config.url}?clientId=${clientId}`;
  }
  
  // Add agent ID to agent-specific endpoints if applicable
  if (config.url?.includes('/agent/') && user?.username) {
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}agentId=${user.username}`;
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
