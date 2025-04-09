
import { Scheme, SchemeFormData } from '@/types/scheme';
import { apiClient } from './client';

export const schemeApi = {
  // Get all schemes
  getSchemes: async (): Promise<Scheme[]> => {
    const response = await apiClient.get('/manager/schemes');
    return response.data.data || [];
  },
  
  // Get a specific scheme
  getScheme: async (id: string): Promise<Scheme> => {
    const response = await apiClient.get(`/manager/scheme/${id}`);
    return response.data.data;
  },
  
  // Create a new scheme
  createScheme: async (data: SchemeFormData): Promise<Scheme> => {
    // clientId will be added automatically by the interceptor
    const response = await apiClient.post('/manager/schemes', data);
    return response.data.data;
  },
  
  // Update an existing scheme
  updateScheme: async (id: string, data: Partial<SchemeFormData>): Promise<Scheme> => {
    // clientId will be added automatically by the interceptor
    const response = await apiClient.put(`/manager/scheme/${id}`, data);
    return response.data.data;
  },
  
  // Delete a scheme
  deleteScheme: async (id: string): Promise<void> => {
    await apiClient.delete(`/manager/scheme/${id}`);
  },
  
  // Create a new version of an existing scheme
  createSchemeVersion: async (id: string): Promise<Scheme> => {
    // clientId will be added automatically by the interceptor
    const response = await apiClient.post(`/manager/scheme/${id}/version`, {});
    return response.data.data;
  },
  
  // Download a scheme as JSON
  downloadScheme: async (id: string, fileName?: string): Promise<void> => {
    const scheme = await schemeApi.getScheme(id);
    
    // Create a Blob from the JSON data
    const blob = new Blob([JSON.stringify(scheme, null, 2)], { type: 'application/json' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `scheme_${scheme.schemeId || scheme.id}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  },
  
  // Copy a scheme (create a duplicate with new ID)
  copyScheme: async (id: string): Promise<Scheme> => {
    // First get the original scheme
    const originalScheme = await schemeApi.getScheme(id);
    
    // Prepare data for the new scheme
    const newSchemeData: SchemeFormData = {
      name: `Copy of ${originalScheme.name}`,
      description: originalScheme.description,
      effectiveStart: originalScheme.effectiveStart,
      effectiveEnd: originalScheme.effectiveEnd,
      quotaAmount: originalScheme.quotaAmount,
      revenueBase: originalScheme.revenueBase,
      configName: originalScheme.configName,
      versionOf: originalScheme.schemeId || originalScheme.id,
      rules: originalScheme.rules,
      payoutStructure: originalScheme.payoutStructure,
      customRules: originalScheme.customRules,
      status: 'Draft'
    };
    
    // Create the new scheme (clientId will be added automatically by the interceptor)
    return await schemeApi.createScheme(newSchemeData);
  }
};
