
import axios from 'axios';

// Base axios instance
export const apiClient = axios.create({
  baseURL: '/api', // Updated to use relative path for proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding client ID
apiClient.interceptors.request.use((config) => {
  // Mock client ID for now
  const clientId = 'client_001';
  
  // Add client ID to all requests
  if (config.url?.includes('?')) {
    config.url = `${config.url}&clientId=${clientId}`;
  } else {
    config.url = `${config.url}?clientId=${clientId}`;
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
