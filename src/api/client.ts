
import axios from 'axios';

// Base axios instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Explicitly point to local backend
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for CORS with credentials
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
    
    // Hard-code the client ID for testing purposes
    // This would usually come from authentication context
    const clientId = "NUVO_01";
    
    // Only add client ID if it's not already in the URL
    if (clientId && !config.url?.includes('clientId=')) {
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
