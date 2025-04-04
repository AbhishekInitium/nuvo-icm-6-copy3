
import { Scheme, SchemeFormData } from '@/types/scheme';
import { apiClient } from './client';

export const schemeApi = {
  // Get all schemes
  getSchemes: async (): Promise<Scheme[]> => {
    const response = await apiClient.get('/manager/schemes', {
      params: { clientId: 'client_XYZ' } // This would normally come from context
    });
    return response.data.data || [];
  },
  
  // Get a specific scheme
  getScheme: async (id: string): Promise<Scheme> => {
    const response = await apiClient.get(`/manager/scheme/${id}`, {
      params: { clientId: 'client_XYZ' } // This would normally come from context
    });
    return response.data.data;
  },
  
  // Create a new scheme
  createScheme: async (data: SchemeFormData): Promise<Scheme> => {
    const payload = {
      ...data,
      clientId: 'client_XYZ', // This would normally come from context
    };
    const response = await apiClient.post('/manager/schemes', payload);
    return response.data.data;
  },
  
  // Update an existing scheme
  updateScheme: async (id: string, data: Partial<SchemeFormData>): Promise<Scheme> => {
    const payload = {
      ...data,
      clientId: 'client_XYZ', // This would normally come from context
    };
    const response = await apiClient.put(`/manager/scheme/${id}`, payload);
    return response.data.data;
  },
  
  // Delete a scheme
  deleteScheme: async (id: string): Promise<void> => {
    await apiClient.delete(`/manager/scheme/${id}`, {
      params: { clientId: 'client_XYZ' } // This would normally come from context
    });
  },
  
  // Create a new version of an existing scheme
  createSchemeVersion: async (id: string): Promise<Scheme> => {
    const response = await apiClient.post(`/manager/scheme/${id}/version`, {
      clientId: 'client_XYZ' // This would normally come from context
    });
    return response.data.data;
  }
};
