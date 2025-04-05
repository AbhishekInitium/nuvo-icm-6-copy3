
import axios from 'axios';

// Base axios instance
export const apiClient = axios.create({
  baseURL: '/api', // Updated to use relative path for proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set MongoDB URI for use in interceptors
let mongoUri = localStorage.getItem('mongodb_uri') || '';

export const setMongoDbUri = (uri: string) => {
  mongoUri = uri;
};

// Request interceptor for adding client ID and MongoDB URI
apiClient.interceptors.request.use((config) => {
  // Mock client ID for now
  const clientId = 'client_001';
  
  // Add client ID to all requests
  if (config.url?.includes('?')) {
    config.url = `${config.url}&clientId=${clientId}`;
  } else {
    config.url = `${config.url}?clientId=${clientId}`;
  }

  // Add MongoDB URI to headers if available
  if (mongoUri) {
    // Use config.headers.set method for TypeScript compatibility
    config.headers = {
      ...config.headers
    };
    
    // Set the x-mongo-uri header safely
    config.headers['x-mongo-uri'] = mongoUri;
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
