
import { ExecutionLog } from '@/types/scheme-run';
import { apiClient } from './client';

export const executionApi = {
  // Get execution logs for a scheme
  getExecutionLogs: async (schemeId: string, clientId: string): Promise<ExecutionLog[]> => {
    const response = await apiClient.get(`/execute/logs`, {
      params: { clientId, schemeId }
    });
    return response.data.success ? response.data.data || [] : [];
  },
  
  // Get execution log details
  getExecutionLogDetails: async (runId: string, clientId: string): Promise<ExecutionLog | null> => {
    const response = await apiClient.get(`/execute/log/${runId}`, {
      params: { clientId }
    });
    return response.data.success ? response.data.data : null;
  },
  
  // Run a scheme simulation
  runSimulation: async (schemeId: string, clientId: string): Promise<any> => {
    const response = await apiClient.post('/execute/run', {
      schemeId,
      mode: 'simulation',
      clientId,
    });
    return response.data;
  },
  
  // Run a scheme in production
  runProduction: async (schemeId: string, clientId: string): Promise<any> => {
    const response = await apiClient.post('/execute/run', {
      schemeId,
      mode: 'production',
      clientId,
    });
    return response.data;
  }
};
