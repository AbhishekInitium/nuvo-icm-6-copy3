
import { apiClient } from './client';
import { Scheme } from '@/types/scheme';
import { ExecutionLog } from '@/types/scheme-run';

export interface SchemeApprovalResponse {
  success: boolean;
  data: Scheme;
}

export const opsApi = {
  // Get all schemes pending approval (Draft or Simulated)
  getSchemesForApproval: async (clientId: string): Promise<Scheme[]> => {
    const response = await apiClient.get('/ops/schemes', {
      params: { clientId }
    });
    return response.data.success ? response.data.data || [] : [];
  },
  
  // Approve a scheme
  approveScheme: async (schemeId: string, clientId: string, notes?: string): Promise<SchemeApprovalResponse> => {
    const response = await apiClient.put(`/ops/scheme/${schemeId}/approve`, {
      clientId,
      notes
    });
    return response.data;
  },
  
  // Get all production runs
  getProductionRuns: async (clientId: string): Promise<ExecutionLog[]> => {
    const response = await apiClient.get('/ops/production-runs', {
      params: { clientId }
    });
    return response.data.success ? response.data.data || [] : [];
  },
  
  // Get production run details
  getProductionRunDetails: async (runId: string, clientId: string): Promise<ExecutionLog | null> => {
    const response = await apiClient.get(`/ops/production-run/${runId}`, {
      params: { clientId }
    });
    return response.data.success ? response.data.data?.executionLog || null : null;
  },
  
  // Export run data as JSON
  exportRunData: async (runId: string, clientId: string): Promise<void> => {
    const runData = await opsApi.getProductionRunDetails(runId, clientId);
    
    if (!runData) {
      throw new Error('Run data not found');
    }
    
    // Create a Blob from the JSON data
    const blob = new Blob([JSON.stringify(runData, null, 2)], { type: 'application/json' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `run_${runId}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  },
  
  // Export run data as CSV
  exportRunDataAsCsv: async (runId: string, clientId: string): Promise<void> => {
    const runData = await opsApi.getProductionRunDetails(runId, clientId);
    
    if (!runData || !runData.agents || runData.agents.length === 0) {
      throw new Error('Run data not found or no agents in run');
    }
    
    // Create CSV header
    let csv = 'AgentID,Qualified,Commission,TotalSales\n';
    
    // Add rows for each agent
    runData.agents.forEach(agent => {
      csv += `${agent.agentId},${agent.qualified},${agent.commission},${agent.totalSales || 0}\n`;
    });
    
    // Create a Blob from the CSV data
    const blob = new Blob([csv], { type: 'text/csv' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `run_${runId}.csv`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }
};
