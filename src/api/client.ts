
import axios from 'axios';

// Base axios instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Explicitly point to local backend
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for CORS with credentials
});

// Add request interceptor to include clientId from auth context
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    
    // Get stored user data from localStorage if available
    const storedUser = localStorage.getItem("auth_user");
    const clientId = storedUser ? JSON.parse(storedUser).clientId : null;
    
    // Only add client ID to non-auth requests
    if (clientId && !config.url?.includes('/auth/')) {
      // Add clientId as query parameter for GET requests
      if (config.method?.toLowerCase() === 'get') {
        if (config.url?.includes('?')) {
          config.url = `${config.url}&clientId=${clientId}`;
        } else {
          config.url = `${config.url}?clientId=${clientId}`;
        }
      } 
      // Add clientId to request body for non-GET requests
      else if (config.data) {
        config.data = { ...config.data, clientId };
      } else {
        config.data = { clientId };
      }
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
