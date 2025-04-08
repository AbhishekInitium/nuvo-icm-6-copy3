
import axios from 'axios';

// Base axios instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // Updated base URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Increasing timeout for development
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    // Get stored user data from localStorage if available
    const storedUser = localStorage.getItem("auth_user");
    const clientId = storedUser ? JSON.parse(storedUser).clientId : null;
    
    // Only add client ID to non-auth requests
    if (clientId && !config.url?.includes('/auth/')) {
      if (config.url?.includes('?')) {
        config.url = `${config.url}&clientId=${clientId}`;
      } else {
        config.url = `${config.url}?clientId=${clientId}`;
      }
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.message);
    
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url
    };
    
    console.error('API Error Details:', errorDetails);
    
    return Promise.reject(error);
  }
);
