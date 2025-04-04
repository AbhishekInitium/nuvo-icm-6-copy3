
import { Scheme, SchemeFormData } from '@/types/scheme';
import { apiClient } from './client';

export const schemeApi = {
  // Get all schemes
  getSchemes: async (): Promise<Scheme[]> => {
    const response = await apiClient.get('/manager/schemes');
    return response.data;
  },
  
  // Get a specific scheme
  getScheme: async (id: string): Promise<Scheme> => {
    const response = await apiClient.get(`/manager/scheme/${id}`);
    return response.data;
  },
  
  // Create a new scheme
  createScheme: async (data: SchemeFormData): Promise<Scheme> => {
    const response = await apiClient.post('/manager/schemes', data);
    return response.data;
  },
  
  // Update an existing scheme
  updateScheme: async (id: string, data: Partial<SchemeFormData>): Promise<Scheme> => {
    const response = await apiClient.put(`/manager/scheme/${id}`, data);
    return response.data;
  },
  
  // Delete a scheme
  deleteScheme: async (id: string): Promise<void> => {
    await apiClient.delete(`/manager/scheme/${id}`);
  }
};
