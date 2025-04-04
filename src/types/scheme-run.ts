
export interface Scheme {
  schemeId: string;
  name: string;
  status: 'Draft' | 'Approved' | 'Simulated' | 'ProdRun';
  effectiveStart: string;
  effectiveEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLog {
  runId: string;
  schemeId: string;
  mode: 'simulation' | 'production';
  executedAt: string;
  summary: {
    totalAgents: number;
    passed: number;
    failed: number;
    totalCommission: number;
  };
  agents: Array<{
    agentId: string;
    qualified: boolean;
    commission: number;
    totalSales?: number;
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
  }>;
}
