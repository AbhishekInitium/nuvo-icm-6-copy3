
import axios from 'axios';

// Create an axios instance with default configuration
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authorization
apiClient.interceptors.request.use(
  (config) => {
    // You could add auth token here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Mock API responses for development
    if (process.env.NODE_ENV === 'development') {
      const { url, method } = error.config;
      
      // Mock configs list
      if (url.includes('/admin/configs') && method.toLowerCase() === 'get') {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { adminName: 'Sales Config A', id: 'config_1' },
              { adminName: 'Enterprise Config B', id: 'config_2' },
              { adminName: 'Premium Team Config', id: 'config_3' },
            ]
          }
        });
      }
      
      // Mock config details
      if (url.includes('/admin/config/') && method.toLowerCase() === 'get') {
        const configName = url.split('/').pop();
        return Promise.resolve({
          data: {
            success: true,
            data: {
              adminName: configName,
              calculationBase: 'Orders',
              baseField: 'OrderTotal',
              qualificationFields: [
                { id: 'OrderType', name: 'Order Type', type: 'string' },
                { id: 'CustomerType', name: 'Customer Type', type: 'string' },
                { id: 'Region', name: 'Region', type: 'string' },
              ],
              adjustmentFields: [
                { id: 'ProductCategory', name: 'Product Category', type: 'string' },
                { id: 'DiscountAmount', name: 'Discount Amount', type: 'number' },
                { id: 'IsPromotion', name: 'Is Promotion', type: 'boolean' },
              ],
              exclusionFields: [
                { id: 'IsInternal', name: 'Is Internal', type: 'boolean' },
                { id: 'IsCancelled', name: 'Is Cancelled', type: 'boolean' },
                { id: 'CustomerBlacklist', name: 'Customer Blacklist', type: 'string' },
              ],
            }
          }
        });
      }
      
      // Mock scheme creation
      if (url.includes('/manager/schemes') && method.toLowerCase() === 'post') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              id: 'scheme_' + Date.now(),
              ...JSON.parse(error.config.data),
              status: 'DRAFT',
              createdAt: new Date().toISOString(),
            }
          }
        });
      }
    }
    
    return Promise.reject(error);
  }
);
