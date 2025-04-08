
import axios from 'axios';

// Base axios instance
export const apiClient = axios.create({
  baseURL: '/api', // Using relative path for proxy
  headers: {
    'Content-Type': 'application/json',
  },
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
      fullURL: config.baseURL + config.url
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
    // Handle error cases, like 401, 403, etc.
    console.error('API Error:', error);
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url
    });
    return Promise.reject(error);
  }
);
