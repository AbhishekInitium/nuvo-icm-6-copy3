
import { apiClient } from './client';

interface AgentScheme {
  schemeId: string;
  runId: string;
  mode: string;
  executedAt: Date;
  schemeName: string;
  description: string;
  effectiveStart: Date | null;
  effectiveEnd: Date | null;
}

interface AgentResult {
  agentId: string;
  schemeId: string;
  schemeName: string;
  runId: string;
  executedAt: Date;
  mode: string;
  qualified: boolean;
  commission: number;
  totalSales: number;
  baseData: Record<string, any>;
  qualifyingCriteria: Record<string, any>;
  exclusions: Record<string, any>;
  adjustments: Record<string, any>;
  customLogic: Record<string, any>;
}

export const agentApi = {
  // Get schemes for the current agent
  getAgentSchemes: async (agentId: string): Promise<AgentScheme[]> => {
    try {
      const response = await apiClient.get('/agent/schemes', {
        params: { agentId }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching agent schemes:', error);
      // Return mock data for development
      return mockAgentSchemes;
    }
  },
  
  // Get result for a specific scheme
  getAgentResultForScheme: async (schemeId: string, agentId: string): Promise<AgentResult> => {
    try {
      const response = await apiClient.get(`/agent/scheme/${schemeId}/result`, {
        params: { agentId }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching agent result for scheme ${schemeId}:`, error);
      // Return mock data for development
      return mockAgentResults[schemeId] || mockAgentResults.default;
    }
  }
};

// Mock data for development
const mockAgentSchemes: AgentScheme[] = [
  {
    schemeId: 'sch_001',
    runId: 'run_123',
    mode: 'production',
    executedAt: new Date('2025-03-15'),
    schemeName: 'Q1 2025 Sales Incentive',
    description: 'Quarterly sales incentive program for all agents',
    effectiveStart: new Date('2025-01-01'),
    effectiveEnd: new Date('2025-03-31')
  },
  {
    schemeId: 'sch_002',
    runId: 'run_456',
    mode: 'production',
    executedAt: new Date('2025-04-01'),
    schemeName: 'Q2 2025 Sales Incentive',
    description: 'Quarterly sales incentive program for all agents',
    effectiveStart: new Date('2025-04-01'),
    effectiveEnd: new Date('2025-06-30')
  },
  {
    schemeId: 'sch_003',
    runId: 'run_789',
    mode: 'simulation',
    executedAt: new Date('2025-04-02'),
    schemeName: 'Product Launch Bonus',
    description: 'Special incentive for new product line launch',
    effectiveStart: new Date('2025-04-15'),
    effectiveEnd: new Date('2025-05-15')
  }
];

// Mock agent results
const mockAgentResults: Record<string, AgentResult> = {
  'sch_001': {
    agentId: 'agent_123',
    schemeId: 'sch_001',
    schemeName: 'Q1 2025 Sales Incentive',
    runId: 'run_123',
    executedAt: new Date('2025-03-15'),
    mode: 'production',
    qualified: true,
    commission: 3200.50,
    totalSales: 98500.00,
    baseData: {
      totalBookings: 98500,
      totalUnits: 45,
      averageOrderValue: 2188.89
    },
    qualifyingCriteria: {
      minBookings: 75000,
      minUnits: 30
    },
    exclusions: {},
    adjustments: {},
    customLogic: {}
  },
  'sch_002': {
    agentId: 'agent_123',
    schemeId: 'sch_002',
    schemeName: 'Q2 2025 Sales Incentive',
    runId: 'run_456',
    executedAt: new Date('2025-04-01'),
    mode: 'production',
    qualified: true,
    commission: 1150.75,
    totalSales: 42500.00,
    baseData: {
      totalBookings: 42500,
      totalUnits: 19,
      averageOrderValue: 2236.84
    },
    qualifyingCriteria: {
      minBookings: 75000,
      minUnits: 30
    },
    exclusions: {},
    adjustments: {},
    customLogic: {}
  },
  'default': {
    agentId: 'agent_123',
    schemeId: 'unknown',
    schemeName: 'Unknown Scheme',
    runId: 'run_000',
    executedAt: new Date(),
    mode: 'unknown',
    qualified: false,
    commission: 0,
    totalSales: 0,
    baseData: {},
    qualifyingCriteria: {},
    exclusions: {},
    adjustments: {},
    customLogic: {}
  }
};
