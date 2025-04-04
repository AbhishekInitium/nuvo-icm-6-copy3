
export interface Scheme {
  id: string;
  schemeId?: string; // MongoDB generated ID
  name: string;
  description?: string;
  status: 'Draft' | 'Approved' | 'Simulated' | 'ProdRun';
  startDate?: string; // Deprecated, replaced by effectiveStart/End
  endDate?: string; // Deprecated, replaced by effectiveStart/End
  effectiveStart: string | Date;
  effectiveEnd: string | Date;
  quotaAmount: number;
  revenueBase: string;
  configName: string;
  clientId: string;
  versionOf?: string; // Reference to parent scheme ID
  rules?: {
    qualifying?: Record<string, any>;
    adjustment?: Record<string, any>;
    exclusions?: Record<string, any>;
    credit?: Record<string, any>;
  };
  payoutStructure: {
    isPercentage?: boolean;
    tiers?: Array<{
      from: number;
      to: number | typeof Infinity;
      value: number;
    }>;
    creditSplit?: Array<{
      role: string;
      percentage: number;
    }>;
  };
  customRules?: Array<{
    name: string;
    criteria: string;
  }>;
  postProcessor?: string | null;
  approvalInfo?: {
    approvedAt: string | Date | null;
    approvedBy: string | null;
    notes: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SchemeFormData {
  name: string;
  description?: string;
  effectiveStart: string | Date;
  effectiveEnd: string | Date;
  quotaAmount: number;
  revenueBase: string;
  configName: string;
  status?: string;
  versionOf?: string;
  rules?: Record<string, any>;
  payoutStructure?: Record<string, any>;
  customRules?: Array<any>;
}
