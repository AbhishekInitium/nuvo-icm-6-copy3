
import { apiClient } from './client';

export interface AgentScheme {
  schemeId: string;
  schemeName: string;
  runId: string;
  mode: 'simulation' | 'production';
  executedAt: string;
  effectiveStart: string | null;
  effectiveEnd: string | null;
}

export interface AgentResult {
  agentId: string;
  schemeId: string;
  schemeName: string;
  runId: string;
  executedAt: string;
  mode: 'simulation' | 'production';
  qualified: boolean;
  commission: number;
  totalSales?: number;
  baseData: any;
  qualifyingCriteria: Array<{
    rule: string;
    result: boolean;
    data: any;
  }>;
  exclusions: any[];
  adjustments: any[];
  customLogic: Array<{
    rule: string;
    result: boolean;
    notes: string;
  }>;
}

export const agentApi = {
  // Get schemes where agent has participated
  getAgentSchemes: async (agentId: string, clientId: string): Promise<AgentScheme[]> => {
    const response = await apiClient.get(`/agent/schemes`, {
      params: { agentId, clientId }
    });
    return response.data.success ? response.data.data || [] : [];
  },
  
  // Get agent-specific result for a scheme
  getAgentResultForScheme: async (schemeId: string, agentId: string, clientId: string): Promise<AgentResult | null> => {
    const response = await apiClient.get(`/agent/scheme/${schemeId}/result`, {
      params: { agentId, clientId }
    });
    return response.data.success ? response.data.data : null;
  }
};
